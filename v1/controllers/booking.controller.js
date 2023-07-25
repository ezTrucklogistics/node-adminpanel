const { Bookingsave , getBooking} = require("../services/booking.service");
const { geocoder , getDistanceAndTime } = require("../../middleware/common.function");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const booking = require("../../models/booking.model");
const {sendResponse} = require("../../services/common.service")
const User = require('../../models/user.model')
const {calculateTotalPrice} = require("../../middleware/earning.system")
const driver = require("../../models/driver.model")
//const { sendPushNotification } = require("../../middleware/push.notification")



exports.Booking = async (req, res) => {

  try {

    const reqBody = req.body;
    const user = req.user;
    console.log(user)
                                                                                                                                                                                                                                                                          
    const pickup_location = await geocoder.geocode(reqBody.pickup_location);

    pickup_location.map((item) => {
      reqBody.pickup_location_lat = item.latitude;
      reqBody.pickup_location_long = item.longitude;
    });
    const drop_location = await geocoder.geocode(reqBody.drop_location);

    drop_location.map((item) => {
      reqBody.drop_location_lat = item.latitude;
      reqBody.drop_location_long = item.longitude;
    });

    const { distance, duration } = await getDistanceAndTime(reqBody.pickup_location, reqBody.drop_location);
    reqBody.distance = distance;
    reqBody.duration = duration; 
    const distanceNumber = parseFloat(distance);
    reqBody.trip_cost =  calculateTotalPrice(distanceNumber, reqBody.truck_type);
   // sendPushNotification()
    reqBody.userId = user._id;
    reqBody.customer_mobile_number = user.mobile_number
    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    const booking = await Bookingsave(reqBody);

    booking.deleted_at = undefined;
    booking.driverId =  undefined;
    booking.pickup_location_lat = undefined;
    booking.pickup_location_long = undefined;
    booking.drop_location_lat = undefined;
    booking.drop_location_long = undefined;
    booking.userId = undefined;

   return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_created',booking)

  } catch (err) {
    console.log("Error(Booking)", err);
   return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


exports.List_of_Booking = async (req, res) => {

  try {

    const bookings = await booking.find(
      {},
      {                                                                                                  
        pickup_location: 1,
        drop_location: 1,
        trip_cost: 1,
        duration: 1,
        distance: 1,
        truck_type: 1,
        status: 1,
      }
    )

    return  sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking', bookings)

  } catch (err) {
    console.log("Error(booking)", err);
    return  sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content',  req.headers.lang)
  }
};


exports.booking_By_Id = async (req, res) => {

  try {

   const { bookingId } = req.params
    const booking = await getBooking(bookingId)

    booking.deleted_at = undefined;                                                                                                                                                                                                            z``
    booking.driverId = undefined;
    booking.pickup_location_lat = undefined;
    booking.pickup_location_long = undefined;
    booking.drop_location_lat = undefined;
    booking.drop_location_long = undefined;
    booking.userId = undefined;

    return  sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking', booking)

  } catch (err) {
    console.log("Error(booking_By_Id)", err);
    return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


 
exports.booking_cancel  = async (req, res) => {

  try {

    const  booking_cancel =  await booking.findOneAndUpdate({ userId : req.user._id }, {
      $set:{booking_status:constants.BOOKING_STATUS.STATUS_CANCEL}
   },{returnOriginal: false});
    
     booking_cancel.deleted_at = undefined;
     booking_cancel.driverId = undefined;
     booking_cancel.pickup_location_lat = undefined;
     booking_cancel.pickup_location_long = undefined;
     booking_cancel.drop_location_lat = undefined;
     booking_cancel.drop_location_long = undefined;
     booking_cancel.userId = undefined;

    return  sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_cancel',  booking_cancel )

  } catch (err) {
    console.log("Error(booking )", err);
    return  sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};


 
exports.booking_confirm  = async (req, res) => {

  try {

    const  booking_cancel =  await booking.findOneAndUpdate({ userId:req.user._id }, {
      $set:{booking_status:constants.BOOKING_STATUS.STATUS_CONFIRM}
   },{new:true});
    
     booking_cancel.deleted_at = undefined;
     booking_cancel.driverId = undefined;
     booking_cancel.pickup_location_lat = undefined;
     booking_cancel.pickup_location_long = undefined;
     booking_cancel.drop_location_lat = undefined;
     booking_cancel.drop_location_long = undefined;
     booking_cancel.userId = undefined;

    return  sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'BOOKING.booking_confirm',  booking_cancel )

  } catch (err) {
    console.log("Error(booking )", err);
    return  sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
  }
};