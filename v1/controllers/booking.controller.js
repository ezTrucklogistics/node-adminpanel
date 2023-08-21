const { Bookingsave } = require("../services/booking.service");
const {
  geocoder,
  getDistanceAndTime,
  generateOtp,
  isArrayofObjectsJSON,
  isJSONString
} = require("../../middleware/common.function");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const booking = require("../../models/booking.model");
const { calculateTotalPrice } = require("../../middleware/earning.system");
const distances = require("../../models/driver_distance_calculate.model");




exports.create_Booking = async (req, res) => {

  try {

    const reqBody = req.body;
    const user = req.user;
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

    reqBody.userId = user._id;
    reqBody.customer_mobile_number = user.mobile_number;
    reqBody.OTP = generateOtp();
    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    const booking = await Bookingsave(reqBody);
    isJSONString(booking)
    booking.deleted_at = undefined;
    booking.driverId = undefined;
    booking.pickup_location_lat = undefined;
    booking.pickup_location_long = undefined;
    booking.drop_location_lat = undefined;
    booking.drop_location_long = undefined;
    booking.userId = undefined;

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , message:"CREATE NEW BOOKING" , booking})
   
  } catch (err) {

    console.log("Error(create_Booking)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , msg:"Something went wrong. Please try again later."})
  }

};


exports.Booking_otp_verify = async (req, res) => {

  try {

    const { OTP } = req.body;

    const bookings = await booking.findOne({ OTP: OTP });

    if (!bookings) {
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


exports.List_of_Booking_by_customers = async (req, res) => {

  try {

    const {
      userId,
      page = 1,
      limit = 10,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "truck_type",
    } = req.query;


    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit) + parseInt(offset);

    const customers = await booking.find({User : userId }, {
      user_type: 0,
      device_token: 0,
      device_type: 0,
      refresh_tokens: 0,
      authTokens: 0,
      deleted_at: 0,
      __v: 0,
      _id: 0,
    }).populate('User' , 'mobile_number email customer_name').populate('driver' , 'driver_mobile_number driver_name driver_email')
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (isArrayofObjectsJSON(customers)) {
      return res.status(constants.WEB_STATUS_CODE.OK).send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "SUCESSFULLY GET ALL BOOKINGS BY CUSTOMERS",
        customers,
      });
    } else {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Unexpected data format: Not an array.",
      });
    }

  } catch (err) {
    console.log("Error(List_of_Booking_by_customers)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        message: "GENERAL.general_error_content",
      });
  }
};



exports.List_of_Booking_by_drivers = async (req, res) => {

  try {

    const {
      userId,
      page = 1,
      limit = 10,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "truck_type",
    } = req.query;


    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit) + parseInt(offset);

    const customers = await booking.find({User : userId }, {
      user_type: 0,
      device_token: 0,
      device_type: 0,
      refresh_tokens: 0,
      authTokens: 0,
      deleted_at: 0,
      __v: 0,
      _id: 0,
    }).populate('User' , 'mobile_number email customer_name').populate('driver' , 'driver_mobile_number driver_name driver_email')
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (isArrayofObjectsJSON(customers)) {
      return res.status(constants.WEB_STATUS_CODE.OK).send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "SUCESSFULLY GET ALL BOOKINGS BY CUSTOMERS",
        customers,
      });
    } else {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Unexpected data format: Not an array.",
      });
    }

  } catch (err) {
    console.log("Error(List_of_Booking_by_drivers)", err);
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
    

    const customers = await booking.find()

      return res.status(constants.WEB_STATUS_CODE.OK).send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "SUCESSFULLY GET ALL BOOKINGS",
        customers,
      });
    
  } catch (err) {
    console.log("Error(List_of_Booking)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        message: "GENERAL.general_error_content",
      });
  }
};



exports.booking_By_Id = async (req, res) => {

  try {

    const { bookingId } = req.query;
    const booking_data = await booking
      .findOne({ _id: bookingId })
      .populate('User' , 'mobile_number email customer_name').populate('driver' , 'driver_mobile_number driver_name driver_email')
      .exec();

    booking_data.deleted_at = undefined;
    booking_data.driverId = undefined;
    booking_data.pickup_location_lat = undefined;
    booking_data.pickup_location_long = undefined;
    booking_data.drop_location_lat = undefined;
    booking_data.drop_location_long = undefined;
    booking_data.userId = undefined;

   return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        message: "SUCESSFULLY GET ALL BOOKINGS", booking_data
      });

  } catch (err) {
    console.log("Error(booking_By_Id)", err);
    return res
    .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
    .send({
      status: constants.STATUS_CODE.FAIL,
      message: "GENERAL.general_error_content",
    });
  }
};

exports.booking_cancel_by_customer = async (req, res) => {

  try {

        await booking.findOneAndUpdate(
      { User: req.user._id },
      {
        $set: { booking_status: constants.BOOKING_STATUS.STATUS_CANCEL },
      },
      { returnOriginal: false }
    );

   let booking_cancel =  await booking.findOneAndUpdate({User: req.user._id} , req.body , {new:true});

    console.log(booking_cancel)
    booking_cancel.deleted_at = undefined;
    booking_cancel.driverId = undefined;
    booking_cancel.pickup_location_lat = undefined;
    booking_cancel.pickup_location_long = undefined;
    booking_cancel.drop_location_lat = undefined;
    booking_cancel.drop_location_long = undefined;
    booking_cancel.userId = undefined;

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        message: "BOOKING CANCEL BY CUSTOMER", booking_cancel
      });

    
  } catch (err) {
    console.log("Error(booking_cancel_by_customer)", err);
    return res
    .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
    .send({
      status: constants.STATUS_CODE.FAIL,
      message: "GENERAL.general_error_content",
    });
  }
};


exports.booking_cancel_by_driver = async (req, res) => {

  try {

    console.log(req.drivers)
    const booking_cancel  = await booking.findOneAndUpdate({ driver: req.drivers._id }, req.body, {
        new: true,
    });

      await booking.findOneAndUpdate(
      { driver: req.drivers._id },
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

    return res
    .status(constants.WEB_STATUS_CODE.OK)
    .send({
      status: constants.STATUS_CODE.SUCCESS,
      message: "BOOKING CANCEL BY DRIVER", booking_cancel
    });

  } catch (err) {
    console.log("Error(booking_cancel_by_driver)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        message: "GENERAL.general_error_content",
      });
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

    return res
    .status(constants.WEB_STATUS_CODE.OK)
    .send({
      status: constants.STATUS_CODE.SUCCESS,
      message: "CUSTOMER BOOKING SUCESSFULLY",
    });


  } catch (err) {
    console.log("Error(booking_confirm)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        message: "GENERAL.general_error_content",
      });
  }
};



exports.customer_to_driver_distance = async (req, res) => {

  try {

    const reqBody = req.body;
    const userId = req.user._id;
   console.log(userId)
    const locations = await booking.findOne({ User: userId });

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

