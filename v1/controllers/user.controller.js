const jwt = require("jsonwebtoken");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const ExcelJs = require("exceljs");
const fs = require("fs");
const { isValid } = require("../../services/blackListMail");
const constants = require("../../config/constants");
const { JWT_SECRET } = require("../../keys/keys");
const driver = require("../../models/driver.model");
const { sendResponse } = require("../../services/common.service")


exports.signUp = async (req, res) => {

  try {
    const reqBody = req.body;
    const checkMail = await isValid(reqBody.email);

    if (checkMail == false)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

    const existMobile = await User.findOne({ mobile_number });

    if (existMobile) {
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'mobile number already exist', {}, req.headers.lang);
    }

    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    reqBody.authTokens = await jwt.sign(
      {
        data: reqBody.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;

    const user = await User.create(reqBody);
    user.user_type = undefined;
    user.refresh_tokens = undefined;
    user.authTokens = undefined;
    user.deleted_at = undefined;
    user.__v = undefined;
    user._id = undefined;

    return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.signUp_success', {}, req.headers.lang);
  } catch (err) {
    console.log("Error(Signup)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.logout = async (req, res) => {

  try {
    const userId = req.user._id;
    let UserData = await User.findById(userId);

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

    const { mobile_number, token, device_type } = req.body;

    let user = await User.findOne({ mobile_number });

    if (!user)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'customer not found', {}, req.headers.lang)

    if (user.user_type == 1)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'your not customer', {}, req.headers.lang)

    let newToken = await user.generateAuthToken();
    let refreshToken = await user.generateRefreshToken();

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { status: constants.STATUS.ACCOUNT_ACTIVE },
      },
      { new: true }
    );

    user.authTokens = newToken;
    user.refresh_tokens = refreshToken;
    user.device_token = token;
    user.device_type = device_type
    let users = await user.save();
    users.user_type = undefined;
    users.refresh_tokens = undefined;
    users.deleted_at = undefined;
    users.__v = undefined;
    users._id = undefined;

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.login_success', users, req.headers.lang)
  } catch (err) {
    console.log("Error(Login)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};

exports.update_Role = async (req, res) => {

  try {

    const { email } = req.query;
    let Roles = await driver.findOneAndUpdate(
      { driver_email: email },
      { set: { user_type: constants.USER_TYPE.CUSTOMER } },
      { new: true }
    );

    if (!Roles) {
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'your are not driver', {}, req.headers.lang)

    }

    let users = new User({
      email: Roles.driver_email,
      customer_name: Roles.driver_name,
      mobile_number: Roles.driver_mobile_number,
      authTokens: Roles.authTokens,
      refresh_tokens: Roles.refresh_tokens,
      status: Roles.status,
      user_type: Roles.user_type,
    });
    await users.save();
    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.role_changed', {}, req.headers.lang)


  } catch (err) {
    console.log("Error(update_Role)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.generate_auth_tokens = async (req, res) => {
  try {
    const { refresh_tokens } = req.params;

    const verified = jwt.verify(refresh_tokens, JWT_SECRET);
    console.log(verified);

    let user = await User.findById(verified._id);
    user.authTokens = await jwt.sign(
      {
        data: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    let token = await user.save();
    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.new_token_generated', token, req.headers.lang)
  } catch (err) {
    console.log("Error(generate_auth_tokens)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.get_all_customer = async (req, res) => {

  try {
    const {
      email,
      customer_name,
      mobile_number,
      page = 1,
      limit = 10,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "email",
    } = req.query;

    const query = {};

    if (email) {
      query.email = { $regex: email, $options: "i" }; // Case-insensitive search by email
    }
    if (mobile_number) {
      query.mobile_number = { $regex: mobile_number, $options: "i" }; // Case-insensitive search by email
    }

    if (customer_name) {
      query.customer_name = { $regex: customer_name, $options: "i" }; // Case-insensitive search by customer name
    }
    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit) + parseInt(offset);

    const customers = await User.find(query, {
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

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.get_all_customers_searched', customers, req.headers.lang)

  } catch (err) {
    console.log("Error(get_all_customer)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};

exports.update_customer = async (req, res) => {

  try {

    const findUser = req.user._id;

    if (!findUser)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'customer id not found', {}, req.headers.lang)

    let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
      new: true,
    });

    if (!user)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'customer data not found', {}, req.headers.lang)
    user.updated_at = await dateFormat.set_current_timestamp();

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.customer_data_updated', user, req.headers.lang)
  } catch (err) {
    console.log("Error(update_customer_detalis)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.delete_customer = async (req, res) => {

  try {
    const userId = req.user._id;

    if (!userId)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'customer id not found', {}, req.headers.lang)
    let customers = await User.findByIdAndDelete(userId);

    if (!customers)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'customer data not found', {}, req.headers.lang)

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.customer_data_deleted', customers, req.headers.lang)
  } catch (err) {
    console.log("Error(delete_customer_detalis)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.export_customer_data_into_excel_file = async (req, res) => {

  try {

    const users = await User.find({ user_type: 2 });
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "customer_Id", key: "customer_Id", width: 15 },
      { header: "profile_img", key: "profile_img", width: 20 },
      { header: "customer_name", key: "customer_name", width: 30 },
      { header: "mobile_number", key: "mobile_number", width: 30 },
      { header: "status", key: "status", width: 30 },
      { header: "email", key: "email", width: 30 },
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
    await workbook.xlsx.writeFile("customer.xlsx");

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.create_new_excel_file', {}, req.headers.lang)

  } catch (err) {
    console.log("Error( export_customer_data_into_excel_file)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.customer_file_export_into_csv_file = async (req, res) => {

  try {
    const users = await User.find({ user_type: 2 });
    const csvData = users.map(
      (user) =>
        `${user.customer_Id},${user.email},${user.customer_name},${user.mobile_number}, ${user.status},${user.profile_img},${user.created_at},${user.updated_at}`
    );
    const csvContent = `customer_Id,email,customer_name,mobile_number,status,profile_img,created_at,updated_at\n${csvData.join(
      "\n"
    )}`;

    fs.writeFile("customerData.csv", csvContent, (error) => {
      if (error) {
        console.error("Error creating CSV file:", error);
      } else {
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.create_new_csv_file', {}, req.headers.lang)
      }
    });

  } catch (err) {
    console.log("Error(customer_file_export_into_csv_file)", err);
    sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};
