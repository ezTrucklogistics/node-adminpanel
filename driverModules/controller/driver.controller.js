
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const { sendResponse } = require("../../services/common.service");
const { geocoder } = require("../../middleware/common.function")
const { JWT_SECRET } = require("../../keys/development.keys")
const jwt = require("jsonwebtoken")
const driver = require("../../models/driver.model");
const booking = require("../../models/booking.model")
const review = require('../../models/review.model')



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

    const check_mobile_number = await driver.findOne({ driver_mobile_number: reqBody.driver_mobile_number })

    if (check_mobile_number)
      return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'DRIVER.mobile_number_check', {}, req.headers.lang);

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

    return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_signup', drivers, req.headers.lang);

  } catch (err) {
    console.log("Error(driver_signup)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.logout = async (req, res) => {

  try {

    const driverId = req.drivers._id;
    let driverData = await driver.findById(driverId);

    if (!driverData)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_not_found', {}, req.headers.lang);

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

    if (!driverdata)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_not_found', {}, req.headers.lang);


    if (driverdata.user_type == 2)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.check_driver_and_customer', {}, req.headers.lang);


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

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_login', driverdata , req.headers.lang);
  } catch (err) {
    console.log("Error(driver_Login)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  };
}


exports.update_current_location = async () => {

  try {

    const { driverId, driver_lat, driver_long } = req.body;
    let update_location = await driver.findOneAndUpdate({ driverId }, { driver_lat, driver_long });
    if (!update_location)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_current_location_not_found', {}, req.headers.lang);

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'DRIVER.driver_current_location_update', {}, req.headers.lang);

  } catch (err) {

    console.log("Error (driver_current_location_update)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
}




exports.update_driver_detalis = async (req, res) => {

  try {

    const driverId = req.drivers._id;
    let reqBody = req.body;
    const existMobileNumber = await driver.findOne({ _id: driverId })

    if(existMobileNumber.driver_mobile_number === reqBody.driver_mobile_number){

      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_same_mobile_number', {}, req.headers.lang);
    }

    if (!driverId) return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER NOT FOUND "
    );

    let driverdata = await driver.findOneAndUpdate({ _id: driverId }, req.body, {
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


exports.delete_driver = async (req, res) => {

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

exports.add_review = async (req , res) => {

  try {
    const { customer_id, driver_id, rating, comment } = req.body;

    // Create a new review
    const newReview = new review({ customer_id, driver_id, rating, comment});
    await newReview.save();

    // Update the driver's rating and total reviews
    const drivers = await driver.findById(driver_id);
    drivers.reviews.push(newReview._id);
    drivers.total_reviews++;
    drivers.rating = (drivers.rating * (drivers.total_reviews - 1) + rating) / drivers.total_reviews;
    await drivers.save();
    return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'DRIVER.add_review', {} , req.headers.lang);
  } catch (error) {
    console.log("Error(add_review)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
}

exports.get_review = async (req , res) => {
     
  try {

    const driverId = req.params.driverId;
    // Retrieve driver information including their reviews
    const drivers = await driver.findById(driverId).populate('reviews');
    if (!drivers)
      return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'DRIVER.driver_not_found', {}, req.headers.lang);

    return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'DRIVER.get_review', drivers , req.headers.lang);
  } catch (error) {
    console.log("Error(get_review)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
   
}






