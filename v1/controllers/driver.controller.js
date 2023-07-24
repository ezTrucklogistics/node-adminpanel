const driver = require("../../models/driver.model");
const { Driversave } = require("../services/driver.service");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const { sendResponse } = require("../../services/common.service");
const { generate_Id } = require("../../middleware/common.function");
const {geocoder} = require("../../middleware/common.function");
const {calculateTotalPriceInDriver} = require("../../middleware/earning.system")


exports.Add_driver_detalis = async (req, res) => {

  try {
    
    const reqBody = req.body;
    const {
      driver_name,
      driver_img,
      driver_email,
      driver_mobile_number,
      vehical_number,
      brand,
      truck_type,
      account_number,
      ifsc_code,
      Aadhar_card_number,
      pan_card_number,
      driving_licence,
      driver_current_location,
      driver_total_earning
    } = reqBody;

    let file = req.file;
    reqBody.driver_img = file.originalname;
    reqBody.driver_total_earning = calculateTotalPriceInDriver()
    reqBody.driverId = generate_Id();
    const pickup_location = await geocoder.geocode(reqBody.driver_current_location);

    pickup_location.map((item) => {
      reqBody.driver_lat = item.latitude;
      reqBody.driver_long = item.longitude;
    });

    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    const driver = await Driversave(reqBody);

    driver.deleted_at = undefined;
    driver.vehical_number = undefined;
    driver.account_number = undefined;
    driver.ifsc_code = undefined;
    driver.Aadhar_card_number = undefined;
    driver.pan_card_number = undefined;
    driver.driving_licence = undefined;
    driver.driverId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.add_driver",
      driver
    );
  } catch (err) {
    console.log("Error(Add_driver_detalis)", err);
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


exports.List_of_driver = async (req, res) => {
  try {
    const list_of_driver = await driver.find(
      {},
      {
        driver_name: 1,
        driver_email: 1,
        driver_img: 1,
        driver_mobile_number: 1,
        status: 1,
        truck_type: 1,
        brand: 1,               
      }
    );

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.List_of_driver",
      list_of_driver
    );
  } catch (err) {
    console.log("Error(booking)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      req.headers.lang
    );
  }
};


exports.driver_account_actived = async (req, res) => {

  try {

    const { driverId } = req.params;

    if (!driverId)
       return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER Id DATA NOT FOUND "
    );;

    let driverdata = await driver.findOneAndUpdate({ _id: driverId }, {
       $set:{status:constants.STATUS.ACCOUNT_ACTIVE}
    },{new:true});

    if (!driverdata)
       return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "DRIVER DATA NOT FOUND "
    );

    driverdata.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"DRIVER ACCOUNT SUCESSFULLY ACTIVED"})
      

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