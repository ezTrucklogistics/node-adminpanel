const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const { sendResponse } = require("../../services/common.service");
const { geocoder } = require("../../middleware/common.function");
const { JWT_SECRET } = require("../../keys/development.keys");
const jwt = require("jsonwebtoken");
const driver = require("../../models/driver.model");
const booking = require("../../models/booking.model");
const review = require("../../models/review.model");
const excel = require("excel4node");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const PDFDocument = require("pdfkit");
const fs = require("fs");

exports.signup = async (req, res) => {
  try {
    const reqBody = req.body;
    reqBody.authTokens = await jwt.sign(
      {
        data: reqBody.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    const driver_current_location = await geocoder.geocode(
      reqBody.driver_current_location
    );

    driver_current_location.map((item) => {
      reqBody.driver_lat = item.latitude;
      reqBody.driver_long = item.longitude;
    });

    const check_mobile_number = await driver.findOne({
      driver_mobile_number: reqBody.driver_mobile_number,
    });

    if (check_mobile_number)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.CREATED,
        constants.STATUS_CODE.SUCCESS,
        "DRIVER.mobile_number_check",
        {},
        req.headers.lang
      );

    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;

    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();

    const drivers = await driver.create(reqBody);

    drivers.deleted_at = undefined;
    drivers.vehical_number = undefined;
    drivers.account_number = undefined;
    drivers.ifsc_code = undefined;
    drivers.Aadhar_card_number = undefined;
    drivers.pan_card_number = undefined;
    drivers.driving_licence = undefined;
    drivers.driverId = undefined;
    drivers.refresh_tokens = undefined;
    drivers.authTokens = undefined;
    drivers.device_token = undefined;
    drivers.device_type = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.driver_signup",
      drivers,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(driver_signup)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.logout = async (req, res) => {
  try {
    const driverId = req.drivers._id;
    let driverData = await driver.findById(driverId);

    if (!driverData)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.driver_not_found",
        {},
        req.headers.lang
      );

    driverData.authTokens = null;
    driverData.refresh_tokens = null;
    await driver.findOneAndUpdate(
      { _id: driverId },
      { $set: { driver_status: constants.DRIVER_STATUS.STATUS_2 } }
    );
    await driverData.save();
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.driver_logout",
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(driver_logout)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.login = async (req, res) => {
  try {
    let reqBody = req.body;
    const { token, device_type } = reqBody;
    let driverdata = await driver.findOne({
      driver_mobile_number: reqBody.driver_mobile_number,
    });

    if (!driverdata)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.driver_not_found",
        {},
        req.headers.lang
      );

    if (driverdata.user_type == 2)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.check_driver_and_customer",
        {},
        req.headers.lang
      );

    let newToken = await driverdata.generateAuthToken();
    let refreshToken = await driverdata.generateRefreshToken();
    driverdata.authTokens = newToken;
    let driverId = driverdata._id;
    console.log(driverId);
    await driver.findOneAndUpdate(
      { _id: driverId },
      { $set: { driver_status: constants.DRIVER_STATUS.STATUS_1 } }
    );
    driverdata.device_token = token;
    driverdata.device_type = device_type;
    await driverdata.save();
    driverdata.user_type = undefined;
    driverdata.device_token = undefined;
    driverdata.device_type = undefined;
    driverdata.refresh_tokens = undefined;
    driverdata.deleted_at = undefined;
    driverdata.status = undefined;
    driverdata.__v = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.driver_login",
      driverdata,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(driver_Login)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.update_current_location = async (req, res) => {
  try {
    const { driver_lat, driver_long, status, device_token } = req.body;

    const drivers = await driver.find({
      device_token: { $ne: null },
      status: "ACTIVE",
    });

    if (!drivers || drivers.length === 0) {
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.not_found",
        {},
        req.headers.lang
      );
    }

    // Update locations and activity status for each driver individually
    for (const driver of drivers) {
      driver.driver_lat = driver_lat;
      driver.driver_long = driver_long;
      driver.status = status;
      driver.lastUpdated = new Date();
      await driver.save();
    }

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.driver_current_location_update",
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(driver_current_location_update)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.update_driver_detalis = async (req, res) => {
  try {
    const driverId = req.drivers._id;
    let reqBody = req.body;
    const existMobileNumber = await driver.findOne({ _id: driverId });

    if (
      existMobileNumber.driver_mobile_number === reqBody.driver_mobile_number
    ) {
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.driver_same_mobile_number",
        {},
        req.headers.lang
      );
    }

    if (!driverId)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER NOT FOUND "
      );

    let driverdata = await driver.findOneAndUpdate(
      { _id: driverId },
      req.body,
      {
        new: true,
      }
    );

    if (!driverdata)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER DATA NOT FOUND"
      );
    driverdata.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      msg: "DRIVER UPDATE SUCESSFULLY",
      driverdata,
    });
  } catch (err) {
    console.log("Error(update_driver_detalis)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.driver_account_actived = async (req, res) => {
  try {
    const findDriver = req.drivers._id;

    if (!findDriver)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER DATA NOT FOUND "
      );

    let driverData = await await driver.findOneAndUpdate(
      { _id: findDriver },
      {
        $set: { status: constants.STATUS.ACCOUNT_ACTIVE },
      },
      { new: true }
    );

    if (!driverData)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER DATA NOT FOUND "
      );

    driverData.updated_at = await dateFormat.set_current_timestamp();
    await driverData.save();

    let Drivers = driverData.status;

    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      msg: "DRIVER SUCESSFULLY ACTIVED",
      Drivers,
    });
  } catch (err) {
    console.log("Error(driver_account_actived)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.add_review = async (req, res) => {
  try {
    const { customerId, driverId, rating, comment } = req.body;

    // Create a new review
    const newReview = new review({ customerId, driverId, rating, comment });
    await newReview.save();

    // Update the driver's rating and total reviews
    const drivers = await driver.findById(driverId);
    drivers.reviews.push(newReview._id);
    drivers.total_reviews++;
    await drivers.save();
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.add_review",
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(add_review)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.get_reviews = async (req, res) => {
  try {
    const driverId = req.params.driverId;
    // Retrieve driver information including their reviews
    const drivers = await driver
      .findById(driverId)
      .populate("reviews", "rating comment");
    if (!drivers)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.driver_not_found",
        {},
        req.headers.lang
      );

    drivers.user_type = undefined;
    drivers.device_token = undefined;
    drivers.device_type = undefined;
    drivers.refresh_tokens = undefined;
    drivers.deleted_at = undefined;
    drivers.status = undefined;
    drivers.__v = undefined;
    drivers._id = undefined;
    drivers.created_at = undefined;
    drivers.updated_at = undefined;
    drivers.driver_lat = undefined;
    drivers.driver_long = undefined;
    drivers.account_number = undefined;
    drivers.ifsc_code = undefined;
    drivers.authTokens = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.get_review",
      drivers,
      req.headers.lang
    );
  } catch (error) {
    console.log("Error(get_review)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};
//excel
exports.driverData_excel = async (req, res) => {
  try {
    const data = await driver.find(
      {},
      {
        driver_name: 1,
        driver_email: 1,
        driver_mobile_number: 1,
        account_number: 1,
        ifsc_code: 1,
        Aadhar_card_number: 1,
        pan_card_number: 1,
        driving_licence: 1,
        truck_type: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    );

    const wb = new excel.Workbook();
    const ws = wb.addWorksheet("Driver Data");

    const headerStyle = wb.createStyle({
      font: {
        bold: true,
      },
      alignment: {
        vertical: "center",
        horizontal: "center",
        wrapText: true,
      },
    });

    const cellStyle = wb.createStyle({
      alignment: {
        vertical: "center",
        horizontal: "center",
        wrapText: true,
      },
    });

    ws.column(1).setWidth(25);
    ws.column(2).setWidth(25);
    ws.column(3).setWidth(25);
    ws.column(4).setWidth(25);
    ws.column(5).setWidth(25);
    ws.column(6).setWidth(25);
    ws.column(7).setWidth(25);
    ws.column(8).setWidth(25);
    ws.column(9).setWidth(25);
    ws.column(10).setWidth(25);
    ws.column(11).setWidth(25);
    ws.column(12).setWidth(25);

    ws.cell(1, 1).string("driver_name").style(headerStyle);
    ws.cell(1, 2).string("driver_email").style(headerStyle);
    ws.cell(1, 3).string("driver_mobile_number").style(headerStyle);
    ws.cell(1, 4).string("account_number").style(headerStyle);
    ws.cell(1, 5).string("ifsc_code").style(headerStyle);
    ws.cell(1, 6).string("Aadhar_card_number").style(headerStyle);
    ws.cell(1, 7).string("pan_card_number").style(headerStyle);
    ws.cell(1, 8).string("driving_licence").style(headerStyle);
    ws.cell(1, 9).string("truck_type").style(headerStyle);
    ws.cell(1, 10).string("Status").style(headerStyle);
    ws.cell(1, 11).string("Created At").style(headerStyle);
    ws.cell(1, 12).string("Updated At").style(headerStyle);

    data.forEach((driver, index) => {
      const rowIndex = index + 2;
      ws.cell(rowIndex, 1).string(driver.driver_name).style(cellStyle);
      ws.cell(rowIndex, 2).string(driver.driver_email).style(cellStyle);
      ws.cell(rowIndex, 3).string(driver.driver_mobile_number).style(cellStyle);
      ws.cell(rowIndex, 4)
        .string(driver.account_number.toString())
        .style(cellStyle);
      ws.cell(rowIndex, 5).string(driver.ifsc_code).style(cellStyle);
      ws.cell(rowIndex, 6)
        .string(driver.Aadhar_card_number.toString())
        .style(cellStyle);
      ws.cell(rowIndex, 7).string(driver.pan_card_number).style(cellStyle);
      ws.cell(rowIndex, 8).string(driver.driving_licence).style(cellStyle);
      ws.cell(rowIndex, 9).string(driver.truck_type).style(cellStyle);
      ws.cell(rowIndex, 10).string(driver.status).style(cellStyle);
      ws.cell(rowIndex, 11).string(driver.created_at).style(cellStyle);
      ws.cell(rowIndex, 12).string(driver.updated_at).style(cellStyle);
    });

    const excelFilePath = "driver_data.xlsx";
    wb.write(excelFilePath, (err) => {
      if (err) {
        console.log("Error creating Excel file:", err);
        return sendResponse(
          res,
          constants.WEB_STATUS_CODE.BAD_REQUEST,
          constants.STATUS_CODE.FAIL,
          "DRIVER.failed_to_create_the_Excel_file",
          {},
          req.headers.lang
        );
      } else {
        return sendResponse(
          res,
          constants.WEB_STATUS_CODE.CREATED,
          constants.STATUS_CODE.SUCCESS,
          "DRIVER.driver_excel_sheet",
          {},
          req.headers.lang
        );
      }
    });
  } catch (err) {
    console.log("Error(driverData_excel)", err);
    sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

//csv file
exports.driverData_csv = async (req, res) => {
  try {
    const data = await driver.find(
      {},
      {
        driver_name: 1,
        driver_email: 1,
        driver_mobile_number: 1,
        account_number: 1,
        ifsc_code: 1,
        Aadhar_card_number: 1,
        pan_card_number: 1,
        driving_licence: 1,
        truck_type: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    );

    const csvFilePath = 'driver_data.csv';

    const formattedData = data.map((driver) => ({
      driver_name: driver.driver_name,
      driver_email: driver.driver_email,
      driver_mobile_number: driver.driver_mobile_number,
      account_number: driver.account_number,
      ifsc_code: driver.ifsc_code,
      Aadhar_card_number: driver.Aadhar_card_number,
      pan_card_number: driver.pan_card_number,
      driving_licence: driver.driving_licence,
      truck_type: driver.truck_type,
      status: driver.status,
      created_at: driver.created_at,
      updated_at: driver.updated_at,
    }));

    // Create a CSV writer
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'driver_name', title: 'Driver Name' },
        { id: 'driver_email', title: 'Driver Email' },
        { id: 'driver_mobile_number', title: 'Driver Mobile Number' },
        { id: 'account_number', title: 'Account Number' },
        { id: 'ifsc_code', title: 'IFSC Code' },
        { id: 'Aadhar_card_number', title: 'Aadhar Card Number' },
        { id: 'pan_card_number', title: 'Pan Card Number' },
        { id: 'driving_licence', title: 'Driving Licence' },
        { id: 'truck_type', title: 'Truck Type' },
        { id: 'status', title: 'Status' },
        { id: 'created_at', title: 'Created At' },
        { id: 'updated_at', title: 'Updated At' },
      ],
    });

    await csvWriter.writeRecords(formattedData);

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      'DRIVER.driver_data_csv_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(driverData_csv)', err);
    sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      'GENERAL.general_error_content',
      err.message,
      req.headers.lang
    );
  }
};

//pdf

exports.driverData_pdf = async (req, res) => {
  try {
    const data = await driver.find(
      {},
      {
        driver_name: 1,
        driver_email: 1,
        driver_mobile_number: 1,
        account_number: 1,
        ifsc_code: 1,
        Aadhar_card_number: 1,
        pan_card_number: 1,
        driving_licence: 1,
        truck_type: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    );

    const pdfFilePath = 'driver_data.pdf';

    const pdfDoc = new PDFDocument();
    const stream = fs.createWriteStream(pdfFilePath);
    pdfDoc.pipe(stream);

    pdfDoc.fontSize(12);
    pdfDoc.fillColor('black');

    data.forEach((driver) => {
      pdfDoc.fillColor('black');
      pdfDoc.font('Helvetica-Bold').text('Driver Name: ').font('Helvetica').text(driver.driver_name);
      pdfDoc.font('Helvetica-Bold').text('Email: ').font('Helvetica').text(driver.driver_email);
      pdfDoc.font('Helvetica-Bold').text('Mobile Number: ').font('Helvetica').text(driver.driver_mobile_number);
      pdfDoc.font('Helvetica-Bold').text('Account Number: ').font('Helvetica').text(driver.account_number);
      pdfDoc.font('Helvetica-Bold').text('IFSC Code: ').font('Helvetica').text(driver.ifsc_code);
      pdfDoc.font('Helvetica-Bold').text('Aadhar Card Number: ').font('Helvetica').text(driver.Aadhar_card_number);
      pdfDoc.font('Helvetica-Bold').text('Pan Card Number: ').font('Helvetica').text(driver.pan_card_number);
      pdfDoc.font('Helvetica-Bold').text('Driving Licence: ').font('Helvetica').text(driver.driving_licence);
      pdfDoc.font('Helvetica-Bold').text('Truck Type: ').font('Helvetica').text(driver.truck_type);
      pdfDoc.font('Helvetica-Bold').text('Status: ').font('Helvetica').text(driver.status);
      pdfDoc.font('Helvetica-Bold').text('Created At: ').font('Helvetica').text(driver.created_at);

      if (driver.updated_at) {
        pdfDoc.font('Helvetica-Bold').text('Updated At: ').font('Helvetica').text(driver.updated_at);
      } else {
        pdfDoc.font('Helvetica-Bold').text('Updated At: N/A');
      }

      pdfDoc.moveDown(0.7); 
      pdfDoc
        .strokeColor('red')
        .lineWidth(1)
        .moveTo(50, pdfDoc.y)
        .lineTo(550, pdfDoc.y)
        .stroke();
    });

    pdfDoc.end();

    res.attachment(pdfFilePath);

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      'DRIVER.driver_data_pdf_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(driverData_pdf)', err);
    sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      'GENERAL.general_error_content',
      err.message,
      req.headers.lang
    );
  }
};
