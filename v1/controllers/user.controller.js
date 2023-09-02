const jwt = require("jsonwebtoken");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
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

    const existMobile = await User.findOne({ mobile_number : reqBody.mobile_number });
    if (existMobile) {
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.check_mobile_number', {}, req.headers.lang);
    }
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
    if(user.user_type !== 2)
    return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.check_customer_or_driver', {} , req.headers.lang);
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




exports.logout = async (req, res) => {

  try {

    const userId = req.user._id;
    let UserData = await User.findById(userId);

    UserData.authTokens = null;
    UserData.refresh_tokens = null;

    await User.findByIdAndUpdate(
      userId,
      {
        $set: { accountActivitions: false },
      },
      { new: true }
    );
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
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_not_found', {}, req.headers.lang)

      if (user.status === constants.STATUS.ACCOUNT_DEACTIVE ) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_in_active', {}, req.headers.lang);
      if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_in_active', {}, req.headers.lang);

      let newToken = await user.generateAuthToken();
      let refreshToken = await user.generateRefreshToken();

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { accountActivitions: true },
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



exports.update_customer = async (req, res) => {

  try {

    const findUser = req.user._id;
    let reqBody = req.body;

    const existMobileNumber = await User.findOne({ _id: findUser})

    if(existMobileNumber.mobile_number === reqBody.mobile_number){

      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'CUSTOMER.customer_same_mobile_number', {}, req.headers.lang);
    }

    if (!findUser)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'customer id not found', {}, req.headers.lang)

    let user = await User.findOneAndUpdate({ _id: findUser }, reqBody, {
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



