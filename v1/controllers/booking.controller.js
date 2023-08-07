const { Bookingsave } = require("../services/booking.service");
const {
  geocoder,
  getDistanceAndTime,
  generateOtp,
} = require("../../middleware/common.function");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const booking = require("../../models/booking.model");
const { sendResponse } = require("../../services/common.service");
const { calculateTotalPrice } = require("../../middleware/earning.system");
const message = require("../../lang/en/message");
//const { sendPushNotification } = require("../../middleware/push.notification")
const distances = require("../../models/driver_distance_calculate.model");

exports.Booking = async (req, res) => {
  try {
    const reqBody = req.body;
    const user = req.user;

    console.log(user);

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

    const { distance, duration } = await getDistanceAndTime(
      reqBody.pickup_location,
      reqBody.drop_location
    );
    reqBody.distance = distance;
    reqBody.duration = duration;
    const distanceNumber = parseFloat(distance);
    reqBody.trip_cost = calculateTotalPrice(
      distanceNumber.toFixed(2),
      reqBody.truck_type
    );

    //sendPushNotification()
    reqBody.userId = user._id;
    reqBody.customer_mobile_number = user.mobile_number;
    reqBody.OTP = generateOtp();
    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    const booking = await Bookingsave(reqBody);

    booking.deleted_at = undefined;
    booking.driverId = undefined;
    booking.pickup_location_lat = undefined;
    booking.pickup_location_long = undefined;
    booking.drop_location_lat = undefined;
    booking.drop_location_long = undefined;
    booking.userId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking_created",
      booking
    );
  } catch (err) {
    console.log("Error(Booking)", err);
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

exports.Booking_otp_verify = async (req, res) => {
  try {
    const { OTP } = req.body;

    const bookings = await booking.findOne({ OTP: OTP });

    if (!booking) {
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({ status: constants.STATUS_CODE.FAIL, message: "OTP NOT FOUND" });
    }

    if (bookings.OTP !== OTP) {
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          message: "OTP NOT MATCH , PLEASE ENTER VALID OTP",
        });
    }

    bookings.OTP = null;
    await bookings.save();
    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        message: "OTP VERIFY SUCESSFULLY",
      });
  } catch (err) {
    console.log("Error(Booking_otp_verify)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        message: "GENERAL.general_error_content",
      });
  }
};

exports.List_of_Booking = async (req, res) => {
  try {
    const bookings = await booking
      .find(
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
      .populate("userId", "customer_name email mobile_number");

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking",
      bookings
    );
  } catch (err) {
    console.log("Error(booking)", err);
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

exports.booking_By_Id = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking_data = await booking
      .findOne({ _id: bookingId })
      .populate("userId", "customer_name email mobile_number")
      .exec();

    booking_data.deleted_at = undefined;
    booking_data.driverId = undefined;
    booking_data.pickup_location_lat = undefined;
    booking_data.pickup_location_long = undefined;
    booking_data.drop_location_lat = undefined;
    booking_data.drop_location_long = undefined;
    booking_data.userId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking",
      booking_data
    );
  } catch (err) {
    console.log("Error(booking_By_Id)", err);
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

exports.booking_cancel_by_customer = async (req, res) => {
  try {
    await booking.findOneAndUpdate({ userId: req.user._id }, req.body, {
      new: true,
    });

    const booking_cancel = await booking.findOneAndUpdate(
      { userId: req.user._id },
      {
        $set: { booking_status: constants.BOOKING_STATUS.STATUS_CANCEL },
      },
      { returnOriginal: false }
    );

    booking_cancel.deleted_at = undefined;
    booking_cancel.driverId = undefined;
    booking_cancel.pickup_location_lat = undefined;
    booking_cancel.pickup_location_long = undefined;
    booking_cancel.drop_location_lat = undefined;
    booking_cancel.drop_location_long = undefined;
    booking_cancel.userId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking_cancel",
      booking_cancel
    );
  } catch (err) {
    console.log("Error(booking )", err);
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

exports.booking_cancel_by_driver = async (req, res) => {
  try {
    await booking.findOneAndUpdate({ driverId: req.drivers._id }, req.body, {
      new: true,
    });

    const booking_cancel = await booking.findOneAndUpdate(
      { driverId: req.drivers._id },
      {
        $set: { booking_status: constants.BOOKING_STATUS.STATUS_CANCEL },
      },
      { returnOriginal: false }
    );

    await booking_cancel.save();

    booking_cancel.deleted_at = undefined;
    booking_cancel.driverId = undefined;
    booking_cancel.pickup_location_lat = undefined;
    booking_cancel.pickup_location_long = undefined;
    booking_cancel.drop_location_lat = undefined;
    booking_cancel.drop_location_long = undefined;
    booking_cancel.userId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking_cancel",
      booking_cancel
    );
  } catch (err) {
    console.log("Error(booking )", err);
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

exports.booking_confirm = async (req, res) => {
  try {
    const { bookingId, driverId } = req.params;

    await bookingooking.findByIdAndUpdate(
      bookingId,
      {
        booking_status: constants.BOOKING_STATUS.STATUS_CONFIRM,
        driverId: driverId,
      },
      { new: true }
    );

    booking_cancel.deleted_at = undefined;
    booking_cancel.driverId = undefined;
    booking_cancel.pickup_location_lat = undefined;
    booking_cancel.pickup_location_long = undefined;
    booking_cancel.drop_location_lat = undefined;
    booking_cancel.drop_location_long = undefined;
    booking_cancel.userId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking_confirm",
      updatedBooking
    );
  } catch (err) {
    console.log("Error(booking )", err);
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

exports.customer_to_driver_distance = async (req, res) => {
  try {
    const reqBody = req.body;
    const userId = req.user._id;
    const locations = await booking.findOne({ userId });
    const { distance, duration } = await getDistanceAndTime(
      reqBody.driver_current_location,
      locations.pickup_location
    );
    reqBody.distance = distance;
    reqBody.duration = duration;
    const distanceNumber = parseFloat(distance);
    const distance_by_driver_customer = await distances.create(reqBody);
    return res
      .status(constants.WEB_STATUS_CODE.CREATED)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        message: "DISTANCE BY DRIVER AND CUSTOMER",
        distance_by_driver_customer,
      });
  } catch (err) {
    console.log("Error(customer_to_driver_distance)", err);

    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        message: "Something went wrong. Please try again later.",
      });
  }
};
