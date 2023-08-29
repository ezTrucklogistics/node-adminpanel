
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const { sendResponse } = require("../../services/common.service");
const { geocoder } = require("../../middleware/common.function")
const { JWT_SECRET } = require("../../keys/development.keys")
const jwt = require("jsonwebtoken")
const ExcelJs = require("exceljs");
const fs = require("fs");
const driver = require("../../models/driver.model");
const booking = require("../../models/booking.model")
const { totalEarningbyDriver } = require("../../middleware/earning.system")
const cron = require('node-cron');




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

    const driver_current_location = await geocoder.geocode(reqBody.driver_current_location);

    driver_current_location.map((item) => {

      reqBody.driver_lat = item.latitude;
      reqBody.driver_long = item.longitude;
    });

    const check_mobile_number = await driver_current_location.findOne({ driver_mobile_number })

    if(check_mobile_number)
    return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'DRIVER.mobile_number_check', {} , req.headers.lang);

    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;

    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
   
    const drivers = await driver.create(reqBody)

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

    return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_signup', drivers , req.headers.lang);

  } catch (err) {
    console.log("Error(driver_signup)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.logout = async (req, res) => {

  try {

    const driverId = req.drivers._id;
    let driverData = await driver.findById(driverId);

    if(!driverData)
    return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_not_found', {} , req.headers.lang);

    driverData.authTokens = null;
    driverData.refresh_tokens = null;
    await driver.findOneAndUpdate({ _id: driverId }, { $set: { driver_status: constants.DRIVER_STATUS.STATUS_2 } })
    await driverData.save();
    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_logout', {}, req.headers.lang);
  } catch (err) {
    console.log("Error(driver_logout)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



exports.login = async (req, res) => {

  try {

    let reqBody = req.body;
    const { driver_mobile_number, token, device_type } = reqBody;

    let driverdata = await driver.findOne({ driver_mobile_number });

     if(!driverdata)
     return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_not_found', {} , req.headers.lang);


    if (driverdata.user_type == 2)
    return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.check_driver_and_customer', {} , req.headers.lang);


    let newToken = await driverdata.generateAuthToken();
    let refreshToken = await driverdata.generateRefreshToken();
    driverdata.authTokens = newToken;
    let driverId = driverdata._id
    await driver.findOneAndUpdate({ _id: driverId }, { $set: { driver_status: constants.DRIVER_STATUS.STATUS_1 } })
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
    driverdata._id = undefined;

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_login', {}, req.headers.lang);
  } catch (err) {
    console.log("Error(driver_Login)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  };
}


exports.update_current_location = async () => {

  try {

   const { driverId, driver_lat, driver_long } = req.body;
   let update_location =  await driver.findOneAndUpdate({ driverId }, { driver_lat, driver_long });
   if(!update_location)
   return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_current_location_not_found', {}, req.headers.lang);

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_current_location_update', {}, req.headers.lang);

  } catch (err) {

    console.log("Error (driver_current_location_update)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
}




exports.generate_auth_tokens = async (req, res) => {

  try {

    const { refresh_tokens } = req.params;
    const verified = jwt.verify(refresh_tokens, JWT_SECRET);
    console.log(verified)

    let drivers = await driver.findById(verified._id);
    drivers.authTokens = await jwt.sign(
      {
        data: drivers.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    await drivers.save();

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({ status: constants.STATUS_CODE.SUCCESS, msg: "CREATE NEW AUTH TOKEN" })

  } catch (err) {
    console.log(err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.get_all_driver = async (req, res) => {

  try {

    const {
      driver_email,
      driver_name,
      page = 1,
      limit = 10,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "driver_email",
    } = req.query;

    const query = {};

    if (driver_email) {
      query.driver_email = { $regex: driver_email, $options: "i" }; // Case-insensitive search by email
    }

    if (driver_name) {
      query.driver_name = { $regex: driver_name, $options: "i" }; // Case-insensitive search by customer name
    }

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit) + parseInt(offset);

    // Count total matching customers
    const totalCustomers = await driver.countDocuments(query);

    const drivers = await driver.find(query, {
      user_type: 0,
      device_token: 0,
      device_type: 0,
      refresh_tokens: 0,
      authTokens: 0,
      deleted_at: 0,
      __v: 0,
      _id: 0,
    })
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (isArrayofObjectsJSON(drivers)) {
      return res.status(constants.WEB_STATUS_CODE.OK).send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "SUCCESSFULLY SEARCHED DRIVERS",
        totalCustomers,
        drivers,
      });
    } else {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Unexpected data format: Not an array.",
      });
    }


  } catch (err) {
    console.log("Error(get_all_drivers)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.update_driver_detalis = async (req, res) => {

  try {

    const findFDriver = req.drivers._id;

    if (!findDriver) return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER NOT FOUND "
    );

    let driverdata = await driver.findOneAndUpdate({ _id: findDriver }, req.body, {
      new: true,
    });

    if (!driverdata)
      return sendResponse(res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER DATA NOT FOUND"
      );

    driverdata.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({ status: constants.STATUS_CODE.SUCCESS, msg: "DRIVER UPDATE SUCESSFULLY", driverdata })

  } catch (err) {
    console.log("Error(update_driver_detalis)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.delete_driver_detalis = async (req, res) => {

  try {

    const driverId = req.drivers._id;

    if (!driverId) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({ status: constants.STATUS_CODE.FAIL, msg: "DRIVER iD NOT FOUND", driverdata })

    let driverdata = await driver.findOneAndDelete({ _id: driverId });

    if (!driverdata)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({ status: constants.STATUS_CODE.FAIL, msg: "DRIVER DATA NOT FOUND", driverdata })

    return res.status(constants.WEB_STATUS_CODE.OK).send({ status: constants.STATUS_CODE.SUCCESS, msg: "DRIVER DATA DELETE SUCESSFULLY", driverdata })

  } catch (err) {
    console.log("Error(update_driver_detalis)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.driver_account_actived = async (req, res) => {

  try {

    const findDriver = req.drivers._id;

    if (!findDriver)
      return sendResponse(res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER DATA NOT FOUND "
      );;

    let driverData = await await driver.findOneAndUpdate({ _id: findDriver }, {
      $set: { status: constants.STATUS.ACCOUNT_ACTIVE }
    }, { new: true });

    if (!driverData)
      return sendResponse(res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER DATA NOT FOUND "
      );

    driverData.updated_at = await dateFormat.set_current_timestamp();
    await driverData.save()

    let Drivers = driverData.status

    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      msg: "DRIVER SUCESSFULLY ACTIVED", Drivers
    })


  } catch (err) {
    console.log("Error(driver_account_actived)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



exports.export_driver_data_into_excel_file = async (req, res) => {

  try {

    const users = await driver.find({ user_type: 1 });
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "driver_img", key: "driver_img", width: 30 },
      { header: "driver_name", key: "driver_name", width: 20 },
      { header: "driver_email", key: "driver_email", width: 20 },
      { header: "driver_mobile_number", key: "driver_mobile_number", width: 20 },
      { header: "status", key: "status", width: 20 },
      { header: "truck_type", key: "truck_type", width: 20 },
      { header: "brand", key: "brand", width: 20 },
      { header: "vehical_number", key: "vehical_number", width: 20 },
      { header: "Aadhar_card_number", key: "Aadhar_card_number", width: 15 },
      { header: "pan_card_number", key: "pan_card_number", width: 15 },
      { header: "driving_licence", key: "driving_licence", width: 20 },
      { header: "account_number", key: "account_number", width: 15 },
      { header: "ifsc_code", key: "ifsc_code", width: 20 },
      { header: "created_at", key: "created_at", width: 30 },
      { header: "updated_at", key: "updated_at", width: 30 },
    ];
    let count = 1;
    users.forEach((user) => {
      user.s_no = count;
      worksheet.addRow(user);
      count += 1;
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile("driver.xlsx");

    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      msg: "CREATE NEW EXCEL FILE"
    })

  } catch (err) {
    console.log("Error( export_driver_data_into_excel_file)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



exports.driver_file_export_into_csv_file = async (req, res) => {

  try {

    const users = await driver.find({ user_type: 1 });
    const csvData = users.map(
      (user) =>
        `${user.driver_img},${user.driver_name},${user.driver_email},${user.driver_mobile_number}, ${user.status},${user.Aadhar_card_number},${user.pan_card_number}${user.ifsc_code},${user.account_number},${user.created_at},${user.updated_at}`
    );
    const csvContent = `driver_img,email,driver_name,driver_email,driver_mobile_number,status,Aadhar_card_number,pan_card_number,ifsc_code,account_number,created_at,updated_at\n${csvData.join(
      "\n"
    )}`;

    fs.writeFile("DriverData.csv", csvContent, (error) => {
      if (error) {
        console.error("Error creating CSV file:", error);
      } else {
        return res.status(constants.WEB_STATUS_CODE.CREATED).send({ status: constants.STATUS_CODE.SUCCESS, msg: "CREATE NEW CSV FILE" })
      }
    });

  } catch (err) {
    console.log("Error(driver_file_export_into_csv_file)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



exports.driver_total_earning = async (req, res) => {

  try {

    const driverId = req.drivers._id;

    const drivers = await booking.find({ driverId })

    let sum = 0;

    for (let i = 0; i < drivers.length; i++) {

      let data = totalEarningbyDriver(drivers[i].trip_cost)
      sum += data;
    }

    const total_earning = Math.floor(sum);
    const driverdata = await driver.findById(driverId)

    driverdata.total_earning = total_earning;
    await driverdata.save()

    return res.status(constants.WEB_STATUS_CODE.OK).send({ status: constants.STATUS_CODE.SUCCESS, msg: "DRIVER TOTAL EARNING IS :", total_earning })


  } catch (err) {
    console.log("Error(driver_total_earning)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



exports.driver_daily_earning = async (req, res) => {

  try {

    const driverId = req.drivers._id;

    const drivers = await booking.find({ driverId })

    let sum = 0;

    for (let i = 0; i < drivers.length; i++) {

      let data = totalEarningbyDriver(drivers[i].trip_cost)
      sum += data;
    }

    const total_earning = Math.floor(sum);
    const driverdata = await driver.findOneAndUpdate({ driverId }, { $set: { daily_earning: total_earning } });
    cron.schedule('0 0-11 * * *', driverdata)
    await driverdata.save()
    return res.status(constants.WEB_STATUS_CODE.OK).send({ status: constants.STATUS_CODE.SUCCESS, msg: "DRIVER DAILY EARNING IS :", daily_earning })

  } catch (err) {

    console.log("Error(driver_daily_earning)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



