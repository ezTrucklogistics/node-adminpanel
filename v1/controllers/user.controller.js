const jwt = require("jsonwebtoken");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const { isValid } = require("../../services/blackListMail");
const constants = require("../../config/constants");
const { JWT_SECRET } = require("../../keys/keys");
const { sendResponse } = require("../../services/common.service")
const Address = require("../../models/contacts.model")
const { validatePhoneNumber } = require("../../validation/user.validator")
const excel = require('excel4node');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs = require('fs');
//const PdfPrinter = require('pdfmake');

exports.signUp = async (req, res) => {

  try {

    const reqBody = req.body;
    const checkMail = await isValid(reqBody.email);
    if (checkMail == false)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

    const existMobile = await User.findOne({ mobile_number: reqBody.mobile_number });

    if (existMobile)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.check_mobile_number', {}, req.headers.lang);

    if (!validatePhoneNumber(reqBody.mobile_number))
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.valid_mobile_number', {}, req.headers.lang);

    reqBody.authTokens = await jwt.sign({
      data: reqBody.email
    }, JWT_SECRET, {
      expiresIn: constants.URL_EXPIRE_TIME
    })

    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();

    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;
    const user = await User.create(reqBody);

    if (user.user_type == 1)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.check_customer_or_driver', {}, req.headers.lang);
    user.user_type = undefined;
    user.refresh_tokens = undefined;
    user.authTokens = undefined;
    user.deleted_at = undefined;
    user.__v = undefined;
    user._id = undefined;

    return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.signUp_success', user, req.headers.lang);
  } catch (err) {
    console.log("Error(Signup)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.change_mobile_number = async (req, res) => {

  try {

    const reqBody = req.body;
    const userId = req.user;
    const customer = User.findOne({ _id: userId });

    if (!validatePhoneNumber(reqBody.mobile_number))
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.valid_mobile_number', {}, req.headers.lang);

    if (customer.mobile_number !== reqBody.mobile_number)
      await User.findOneAndUpdate({ _id: userId }, { $set: { mobile_number: reqBody.mobile_number } }, { new: true });
    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.update_mobile_number', {}, req.headers.lang);

  } catch (err) {
    console.log("Error(change_mobile_number)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
}


exports.logout = async (req, res) => {

  try {

    const userId = req.user._id;
    let UserData = await User.findById(userId);

    if (UserData.user_type == 1)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.check_customer_or_driver', {}, req.headers.lang);

    UserData.authTokens = null;
    UserData.refresh_tokens = null;
    await UserData.save();
    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.logout_success', {}, req.headers.lang)


  } catch (err) {
    console.log("Error(logout)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};



exports.login = async (req, res) => {

  try {

    const { token, device_type } = req.body;
    let user = await User.findOne({ mobile_number: req.body.mobile_number });
    console.log(user._id)

    if (!user)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_not_found', {}, req.headers.lang)

    if (user.status === constants.STATUS.ACCOUNT_DEACTIVE) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_in_active', {}, req.headers.lang);
    if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_in_active', {}, req.headers.lang);

    if (!validatePhoneNumber(req.body.mobile_number))
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.valid_mobile_number', {}, req.headers.lang);

    if (user.user_type == 1)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.check_customer_or_driver', {}, req.headers.lang);

    let newToken = await user.generateAuthToken();
    let refreshToken = await user.generateRefreshToken();

    user.authTokens = newToken;
    user.refresh_tokens = refreshToken;
    user.device_token = token;
    user.device_type = device_type
    let users = await user.save();
    users.user_type = undefined;
    users.refresh_tokens = undefined;
    users.deleted_at = undefined;
    users.__v = undefined;


    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.login_success', users, req.headers.lang)
  } catch (err) {
    console.log("Error(Login)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.get_all_customer = async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const perPage = parseInt(req.query.perPage) || 10;
    const sortBy = req.query.sortBy || 'created_at';
    const sortOrder = req.query.sortOrder || 'asc';

    const skip = (page - 1) * perPage;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const users = await User.find(
      {},
      {
        _id: 1,
        customer_name: 1,
        email: 1,
        mobile_number: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    )
      .skip(skip)
      .limit(perPage)
      .sort(sortOptions);

     const countUser =  await User.countDocuments();
     let data = { countUser ,  users}

    if (users.length == 0 && !users)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_data_not_found', {}, req.headers.lang)

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.get_all_customers', data , req.headers.lang);

  } catch (err) {
    console.log("Error(get_all_customer)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};




exports.update_customer = async (req, res) => {

  try {

    const findUser = req.user._id;
    let reqBody = req.body;
    const existMobileNumber = await User.findOne({ _id: findUser })

    if (existMobileNumber.mobile_number === reqBody.mobile_number)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_same_mobile_number', {}, req.headers.lang);

    if (!findUser)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_id_not_found', {}, req.headers.lang)

    let user = await User.findOneAndUpdate({ _id: findUser }, reqBody, {
      new: true,
    });

    if (!user)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_data_not_found', {}, req.headers.lang)
    user.updated_at = await dateFormat.set_current_timestamp();

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.customer_data_updated', user, req.headers.lang)
  } catch (err) {
    console.log("Error(update_customer_detalis)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};




exports.create_contacts = async (req, res) => {

  try {
    
    const findUser = req.user._id;
    let reqBody = req.body;
    if (!findUser)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_id_not_found', {}, req.headers.lang)
    reqBody.User = findUser;
    const contacts = await Address.create(reqBody)
    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.add_contact', contacts, req.headers.lang)

  } catch (err) {
    console.log("Error(create_contact)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.get_contacts = async (req, res) => {

  try {

    const { contactId } = req.params;

    const contacts = await Address.findOne({ _id: contactId}).populate(
      'User',
      'customer_name email mobile_number'
    );

    if (!contacts) {
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        'CUSTOMER.customer_not_found',
        {},
        req.headers.lang
      );
    }

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.get_contact', contacts, req.headers.lang);

  } catch (err) {
    console.log("Error(get_contact)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.update_contact = async (req, res) => {

  try {

    const { contactId } = req.query;
    let reqBody = req.body;

    let user = await Address.findOneAndUpdate({ _id: contactId }, reqBody, {

      new: true,
    });

    if (!user)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_not_found', {}, req.headers.lang)

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.update_contact', user, req.headers.lang)

  } catch (err) {
    console.log("Error(update_contact)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


//excel
exports.userData_excel = async (req , res) => {

  try {
     
    const data = await User.find(
      {},
      { 
        customer_name: 1,
        email: 1,
        mobile_number: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    );

    const wb = new excel.Workbook();
    const ws = wb.addWorksheet('User Data');

    const headerStyle = wb.createStyle({
      font: {
        bold: true,
      },
      alignment: {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true,
      },
    });

    // Define cell styles for data cells
    const cellStyle = wb.createStyle({
      alignment: {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true,
      },
    });
   
    ws.column(1).setWidth(25); 
    ws.column(2).setWidth(25); 
    ws.column(3).setWidth(25); 
    ws.column(4).setWidth(25); 
    ws.column(5).setWidth(25); 
    ws.column(6).setWidth(25);
    
    ws.cell(1, 1).string('Customer Name').style(headerStyle)
    ws.cell(1, 2).string('Email').style(headerStyle)
    ws.cell(1, 3).string('Mobile Number').style(headerStyle)
    ws.cell(1, 4).string('Status').style(headerStyle)
    ws.cell(1, 5).string('Created At').style(headerStyle)
    ws.cell(1, 6).string('Updated At').style(headerStyle)

    // Add data rows
    data.forEach((user, Index) => {
      const index = Index + 2;
      ws.cell(index + 2, 1).string(user.customer_name).style(cellStyle);
      ws.cell(index + 2, 2).string(user.email).style(cellStyle);
      ws.cell(index + 2, 3).string(user.mobile_number).style(cellStyle);
      ws.cell(index + 2, 4).string(user.status).style(cellStyle);
      ws.cell(index + 2, 5).string(user.created_at).style(cellStyle);
      ws.cell(index + 2, 6).string(user.updated_at).style(cellStyle);
    });

    const excelFilePath = 'user_data.xlsx';
    wb.write(excelFilePath);

   return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.created_excel_file', {} , req.headers.lang)
      
  } catch (err) {
    console.log("Error(userData_excel)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
    
}

//csv
exports.userData_csv = async (req, res) => {
  try {
    const data = await User.find(
      {},
      {
        customer_name: 1,
        email: 1,
        mobile_number: 1,
        status: 1,
        created_at: 1,
        updated_at: 1,
      }
    );
    const csvFilePath = 'user_data.csv';

   
    const formattedData = data.map((user) => ({
      customer_name: user.customer_name,
      email: user.email,
      mobile_number: user.mobile_number,
      status: user.status,
      created_at: user.created_at,
      updated_at: user.updated_at,
      row_height: 30, 
    }));

    // Create a CSV writer
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'customer_name', title: 'Customer Name' },
        { id: 'email', title: 'Email' },
        { id: 'mobile_number', title: 'Mobile Number' },
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
      'CUSTOMER.userData_csv_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(userData_csv)', err);
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
exports.userData_pdf = async (req, res) => {
  try {
    const data = await User.find(
      {},
      {
        customer_name: 1,
        email: 1,
        mobile_number: 1,
        status: 1,
        created_at: 1,
        updated_at: 1, 
      }
    );

    const pdfFilePath = 'user_data.pdf';

    const pdfDoc = new PDFDocument();
    const stream = fs.createWriteStream(pdfFilePath);
    pdfDoc.pipe(stream);

    pdfDoc.fontSize(12);
    pdfDoc.fillColor('black');

    const col1X = 50;
    const col2X = 200;
    const col3X = 350;
    const col4X = 450;
    const col5X = 550;
    const col6X = 650; 
    pdfDoc.font('Helvetica-Bold').text('Customer Name', col1X, 40);
    pdfDoc.text('Email', col2X, 40);
    pdfDoc.text('Mobile Number', col3X, 40);
    pdfDoc.text('Status', col4X, 40);
    pdfDoc.text('Created At', col5X, 40);
    pdfDoc.text('Updated At', col6X, 40);
    let yPosition = 80; 

    data.forEach((user) => {
      pdfDoc.font('Helvetica').text(user.customer_name, col1X, yPosition);
      pdfDoc.text(user.email, col2X, yPosition);
      pdfDoc.text(user.mobile_number, col3X, yPosition);
      pdfDoc.text(user.status, col4X, yPosition);
      pdfDoc.text(user.created_at, col5X, yPosition);

      if (user.updated_at) {
       
        pdfDoc.text(user.updated_at, col6X, yPosition); 
      } else {
        pdfDoc.text('', col6X, yPosition); 
      }
      pdfDoc
        .moveTo(col1X, yPosition)
        .lineTo(col2X, yPosition)
        .lineTo(col3X, yPosition)
        .lineTo(col4X, yPosition)
        .lineTo(col5X, yPosition)
        .lineTo(col6X, yPosition) 
      yPosition += 20; 
    });

    pdfDoc.end();

    res.attachment(pdfFilePath);

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      'CUSTOMER.userData_pdf_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(userData_pdf)', err);
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
