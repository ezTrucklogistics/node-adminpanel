const { sendResponse } = require("../../services/common.service");
const {
  geocoder,
  getDistanceAndTime,
  generateOtp,
} = require("../../middleware/common.function");
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const booking = require("../../models/booking.model");
const {
  calculateTotalPrice,
  totalEarningbyDriver,
  companyShareAmount
} = require("../../middleware/earning.system");
const {
  sendFCMNotificationToCustomer,
  sendNotificationsToAllDrivers,
} = require("../../middleware/check_available_drivers");
const driver = require("../../models/driver.model");
const User = require("../../models/user.model");
const excel = require('excel4node');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const PDFDocument = require('pdfkit');
const fs=require('fs');

exports.create_Booking = async (req, res) => {
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

    reqBody.User = user._id;
    reqBody.customer_mobile_number = user.mobile_number;
    reqBody.OTP = generateOtp();
    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    const bookings = await booking.create(reqBody);
    const findUsers = await User.findOne({ _id: user._id });

    let bookingData = {
      pickupLocations_Lat: bookings.pickup_location_lat,
      pickupLocation_Long: bookings.pickup_location_long,
      dropupLocations_Lat: bookings.drop_location_lat,
      dropupLocations_Long: bookings.drop_location_long,
      name: findUsers.customer_name,
      mobile_number: findUsers.mobile_number,
      BookingId: bookings._id,
      otp: bookings.OTP,
    };

    let customerLocation = {
      latitude: bookings.pickup_location_lat,
      longitude: bookings.pickup_location_long,
    };

    sendNotificationsToAllDrivers(customerLocation, bookingData);

    bookings.deleted_at = undefined;
    bookings.driverId = undefined;
    bookings.pickup_location_lat = undefined;
    bookings.pickup_location_long = undefined;
    bookings.drop_location_lat = undefined;
    bookings.drop_location_long = undefined;
    bookings.userId = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.booking_created",
      bookings,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(create_Booking)", err);
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

//BOOKIN OFLINE//
exports.createbooking_offline = async (req, res) => {
    try {
        const {
            pickup_location,
            drop_location,
            trip_cost,
            duration,
            distance,
            User,
            driver,
            truck_type,
            booking_status
        } = req.body;
        const total_discount = 0.1 * trip_cost; 

        const { driverShare, finalPrice } = calculateTotalPrice(Number(distance), truck_type);
        const newBooking = new booking({
            pickup_location,
            drop_location,
            trip_cost,
            duration,
            distance,
            User,
            driver,
            truck_type,
            booking_status,
            total_discount,
            driver_share: driverShare, 
            final_Price : finalPrice 
        });
        await newBooking.save();
        return sendResponse(
            res,
            constants.WEB_STATUS_CODE.CREATED,
            constants.STATUS_CODE.SUCCESS,
            "BOOKING.booking_created",
            {
                pickup_location,
                drop_location,
                trip_cost,
                duration,
                distance,
                User,
                driver,
                truck_type,
                booking_status,
                total_discount,
                driver_share: driverShare, 
                final_price: finalPrice 
            },
            req.headers.lang
        );
    } catch (err) {
        console.log("Error(createOrder)", err);
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
    const bookings = await booking.find({ OTP: OTP });

    if (!bookings || bookings.length === 0) {
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "BOOKING.booking_data_not_found",
        {},
        req.headers.lang
      );
    }

    const matchingBooking = bookings.find(
      (bookingItem) => bookingItem.OTP === OTP
    );

    if (!matchingBooking) {
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "BOOKING.otp_not_match",
        {},
        req.headers.lang
      );
    }

    matchingBooking.OTP = null;
    await matchingBooking.save();

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.otp_verify",
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(Booking_otp_verify)", err);
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

    const customers = await booking
      .find(
        { User: userId },
        {
          user_type: 0,
          device_token: 0,
          device_type: 0,
          refresh_tokens: 0,
          authTokens: 0,
          deleted_at: 0,
          __v: 0,
          _id: 0,
        }
      )
      .populate("User", "mobile_number email customer_name")
      .populate("driver", "driver_mobile_number driver_name driver_email")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

    if (!customers || customers.length == 0)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "CUSTOMER.customer_not_found",
        {},
        req.headers.lang
      );

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.get_booking_by_customer",
      customers,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(List_of_Booking_by_customers)", err);
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

exports.List_of_Booking_by_drivers = async (req, res) => {
  try {
    const {
      driverId,
      page = 1,
      limit = 10,
      offset = 0,
      sortBy = "created_at",
      sortOrder = "truck_type",
    } = req.query;

    // Calculate skip for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit) + parseInt(offset);

    const drivers = await booking
      .find(
        { driver: driverId },
        {
          user_type: 0,
          device_token: 0,
          device_type: 0,
          refresh_tokens: 0,
          authTokens: 0,
          deleted_at: 0,
          __v: 0,
          _id: 0,
        }
      )
      .populate("driver", "driver_mobile_number driver_name driver_email")
      .populate("User", "mobile_number email customer_name")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(parseInt(limit));

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

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.get_booking_by_driver",
      drivers,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(List_of_Booking_by_drivers)", err);
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
    let users = await booking.findOneAndUpdate(
      { User: req.user._id },
      {
        $set: { booking_status: constants.BOOKING_STATUS.STATUS_CANCEL },
      },
      { returnOriginal: false }
    );

    if (!users)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "CUSTOMER.customer_not_found",
        {},
        req.headers.lang
      );

    let booking_cancel = await booking.findOneAndUpdate(
      { User: req.user._id },
      req.body,
      { new: true }
    );

    if (!booking_cancel)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "BOOKING.booking_data_not_found",
        {},
        req.headers.lang
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
      "BOOKING.booking_cancel_by_customer",
      booking_cancel,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(booking_cancel_by_customer)", err);
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
    const drivers = await booking.findOneAndUpdate(
      { driver: req.drivers._id },
      req.body,
      {
        new: true,
      }
    );

    if (!drivers)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.driver_not_found",
        {},
        req.headers.lang
      );

    let booking_cancel = await booking.findOneAndUpdate(
      { driver: req.drivers._id },
      {
        $set: { booking_status: constants.BOOKING_STATUS.STATUS_CANCEL },
      },
      { returnOriginal: false }
    );

    if (!booking_cancel)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "BOOKING.booking_data_not_found",
        {},
        req.headers.lang
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
      "BOOKING.booking_cancel_by_driver",
      booking_cancel,
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(booking_cancel_by_driver)", err);
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

    let bookings = await booking.findOneAndUpdate(
      { _id: bookingId },
      { $set: { booking_status: constants.BOOKING_STATUS.STATUS_CONFIRM } }
    );
    console.log(bookings)
    if (!bookings)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "BOOKING.booking_data_not_found",
        {},
        req.headers.lang
      );
      bookings.driver = driverId;

    const users = await User.findOne({ _id: bookings.User });
    if (!users)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "CUSTOMER.customer_not_found",
        {},
        req.headers.lang
      );

    const drivers = await driver.findOne({ _id: bookings.driver });

    if (!drivers)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "DRIVER.driver_not_found",
        {},
        req.headers.lang
      );

    bookings.driver_share = totalEarningbyDriver(parseInt(bookings.trip_cost))
    bookings.company_share = companyShareAmount(parseInt(bookings.trip_cost))
    await bookings.save();

    let driverData = {
      driver_name: drivers.driver_name,
      mobile_number: drivers.driver_mobile_number,
      truck: drivers.truck_type,
    };

    sendFCMNotificationToCustomer(users.device_token, driverData)
      .then(() => {
        console.log("Notification sent successfully");
      })
      .catch((err) => {
        console.log("ERROR in send this notification", err.message);
      });

    bookings.deleted_at = undefined;
    bookings.driver = undefined;
    bookings.pickup_location_lat = undefined;
    bookings.pickup_location_long = undefined;
    bookings.drop_location_lat = undefined;
    bookings.drop_location_long = undefined;
    bookings.User = undefined;

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.driver_booking_confirm",
      {},
      req.headers.lang
    );

  } catch (err) {
    console.log("Error(booking_confirm)", err);
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

exports.Booking_completed = async (req, res) => {
  try {
    const { bookingId } = req.params;
    let bookings = await booking.findOneAndUpdate(
      { _id: bookingId },
      { $set: { booking_status: constants.BOOKING_STATUS.STATUS_COMPLETED } }
    );
    if (!bookings)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "BOOKING.booking_data_not_found",
        {},
        req.headers.lang
      );
    const customers = await User.findOne({ _id: bookings.User });
    const doc = new PDFDocument();
    const stream = fs.createWriteStream("Invoice.pdf");
    doc.pipe(stream);
    doc.fontSize(16);
    doc
      .text("Trip Details", { align: "center" })
      .text(`customer name : ${customers.customer_name}`)
      .text(`Pick-up Location: ${bookings.pickup_location}`)
      .text(`Drop Location: ${bookings.drop_location}`)
      .text(`Name of the Vehical: ${bookings.truck_type}`)
      .text(`Trip Cost: ${bookings.trip_cost}`)
      .text(`distance : ${bookings.distance}`);

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.ride_completed",
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log("Error(booking_completed)", err);
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


exports.total_amount_by_company_share = async (req , res) => {

  try {

    const bookings = await booking.find({} , {company_share: 1});
    console.log(bookings)

    if(bookings.length == 0 && !bookings)
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "BOOKING.booking_data_not_found",
      {},
      req.headers.lang
    );
    

    let sum = 0;
    for (const company of bookings) {
         sum += company.company_share;
    }
    
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.company_share",
      sum,
      req.headers.lang
    );


  } catch (err) {
    console.log("Error(total_amount_by_company_share)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
}

exports.total_earning_by_driver = async (req , res) => {

  try {

    const { driverId } = req.params;
    const bookings = await booking.find({driver: driverId})

    if(bookings.length == 0 && !bookings)
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "BOOKING.booking_data_not_found",
      {},
      req.headers.lang
    );
    
    let sum = 0;
    for (const driverEarn of bookings) {
         sum += driverEarn.driver_share;
    }

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "BOOKING.total_earning_by_driver",
      sum,
      req.headers.lang
    );


  } catch (err) {
    console.log("Error(total_earning_by_driver)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
}


exports.search_all_the_earning_by_driver = async (req , res) => {

  try {

    const {  startDate, endDate , year, month, driverName, pageSize = 10, pageNumber = 1 } = req.query;
  
    const filter = {};

    if (year) {
      filter['created_at'] = { $gte: new Date(`${year}-01-01`), $lt: new Date(`${year + 1}-01-01`) };
    }

    if (startDate && endDate) {
      filter['created_at'] = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter['created_at'] = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter['created_at'] = { $lte: new Date(endDate) };
    }


    if (month) {
      filter['created_at'] = {
        ...filter['created_at'],
        $gte: new Date(`${year}-${month}-01`),
        $lt: new Date(`${year}-${parseInt(month) + 1}-01`),
      }; 
    }

    if (driverName) {
      filter['driver'] = { $in: driverName };
    }
   
  
    const skip = (pageNumber - 1) * pageSize;
    const limit = parseInt(pageSize);

    const driverEarnings = await booking.find(filter)
      .skip(skip)
      .limit(limit)
      .populate('driver', 'driver_name');

      return sendResponse(res,constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, "BOOKING.total_earning_by_driver", driverEarnings , req.headers.lang);
   
  } catch (err) {
    console.log("Error(search_all_the_earning_by_driver)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
}
//====
exports.earningsLast24HoursByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const currentTime = new Date();
    const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000);

    // Find bookings within the last 24 hours for the specified driver
    const bookings = await booking.find({
      driver: driverId,
      createdAt: {
        $gte: twentyFourHoursAgo,
        $lte: currentTime,
      },
    });

    let totalEarnings = 0;
    for (const booking of bookings) {
      totalEarnings += booking.driver_share;
    }

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER. Day_earning",
      totalEarnings,
      req.headers.lang
    );
  } catch (err) {
    console.error("Error(earningsLast24HoursByDriver)", err);
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


//
exports.earningsLastMonthByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const currentTime = new Date();
    const thirtyDaysAgo = new Date(currentTime - 30 * 24 * 60 * 60 * 1000); // 30 days ago

    // Find bookings within the last month for the specified driver
    const bookings = await booking.find({
      driver: driverId,
      createdAt: {
        $gte: thirtyDaysAgo,
        $lte: currentTime,
      },
    });

    let totalEarnings = 0;
    for (const booking of bookings) {
      totalEarnings += booking.driver_share;
    }

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.Monthly_earning",
      totalEarnings,
      req.headers.lang
    );
  } catch (err) {
    console.error("Error(earningsLastMonthByDriver)", err);
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

//year
exports.earningsLastYearByDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const currentTime = new Date();
    const oneYearAgo = new Date(currentTime - 365 * 24 * 60 * 60 * 1000); // 365 days ago

    // Find bookings within the last year for the specified driver
    const bookings = await booking.find({
      driver: driverId,
      createdAt: {
        $gte: oneYearAgo,
        $lte: currentTime,
      },
    });

    let totalEarnings = 0;
    for (const booking of bookings) {
      totalEarnings += booking.driver_share;
    }

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.OK,
      constants.STATUS_CODE.SUCCESS,
      "DRIVER.Yearly_earning",
      totalEarnings,
      req.headers.lang
    );
  } catch (err) {
    console.error("Error(earningsLastYearByDriver)", err);
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
exports.bookingData_excel = async (req, res) => {
  try {
    const data = await booking.find({}).populate('User driver').exec();

    const wb = new excel.Workbook();
    const ws = wb.addWorksheet('Booking Data');

    const headerStyle = wb.createStyle({
      font: {
        bold: true,
        color: 'white',
      },
      fill: {
        type: 'pattern',
        patternType: 'solid',
        fgColor: 'blue',
      },
      alignment: {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true,
      },
    });

    const cellStyle = wb.createStyle({
      alignment: {
        vertical: 'center',
        horizontal: 'center',
        wrapText: true,
      },
    });

    // Define column widths
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
    ws.column(13).setWidth(25);
    ws.column(14).setWidth(25);
    ws.column(15).setWidth(25);
    ws.column(16).setWidth(25);
    ws.column(17).setWidth(25);
    ws.column(18).setWidth(25);

    // Define header row
    ws.cell(1, 1).string('Pickup Location').style(headerStyle);
    ws.cell(1, 2).string('Drop Location').style(headerStyle);
    ws.cell(1, 3).string('Trip Cost').style(headerStyle);
    ws.cell(1, 4).string('Duration').style(headerStyle);
    ws.cell(1, 5).string('Distance').style(headerStyle);
    ws.cell(1, 6).string('Truck Type').style(headerStyle);
    ws.cell(1, 7).string('Booking Status').style(headerStyle);
    ws.cell(1, 8).string('Booking Cancel Reason (Customer)').style(headerStyle);
    ws.cell(1, 9).string('Booking Cancel Reason (Driver)').style(headerStyle);
    ws.cell(1, 10).string('Total Company Share').style(headerStyle);
    ws.cell(1, 11).string('Total Earning by Driver').style(headerStyle);
    ws.cell(1, 12).string('Payment Type').style(headerStyle);
    ws.cell(1, 13).string('OTP').style(headerStyle);
    ws.cell(1, 14).string('Created At').style(headerStyle);
    ws.cell(1, 15).string('Updated At').style(headerStyle);
    ws.cell(1, 16).string('Total Discount').style(headerStyle);
    ws.cell(1, 17).string('User Name').style(headerStyle); // User name
    ws.cell(1, 18).string('Driver Name').style(headerStyle); // Driver name

    // Add data rows
    data.forEach((booking, index) => {
      const rowIndex = index + 2;
      ws.cell(rowIndex, 1).string(booking.pickup_location || '').style(cellStyle);
      ws.cell(rowIndex, 2).string(booking.drop_location || '').style(cellStyle);
      ws.cell(rowIndex, 3).number(booking.trip_cost).style(cellStyle);
      ws.cell(rowIndex, 4).string(booking.duration || '').style(cellStyle);
      ws.cell(rowIndex, 5).string(booking.distance || '').style(cellStyle);
      ws.cell(rowIndex, 6).string(booking.truck_type || '').style(cellStyle);
      ws.cell(rowIndex, 7).string(booking.booking_status || '').style(cellStyle);
      ws.cell(rowIndex, 8).string(booking.booking_cancel_reason_for_customer || '').style(cellStyle);
      ws.cell(rowIndex, 9).string(booking.booking_cancel_reason_for_driver || '').style(cellStyle);
      ws.cell(rowIndex, 10).number(booking.total_company_share).style(cellStyle);
      ws.cell(rowIndex, 11).number(booking.total_earning_by_driver).style(cellStyle);
      ws.cell(rowIndex, 12).string(booking.payment_type || '').style(cellStyle);
      ws.cell(rowIndex, 13).string(booking.OTP || '').style(cellStyle);
      ws.cell(rowIndex, 14).string(booking.created_at || '').style(cellStyle);
      ws.cell(rowIndex, 15).string(booking.updated_at || '').style(cellStyle);
      ws.cell(rowIndex, 16).number(booking.total_discount).style(cellStyle);

      // Add user and driver names
      ws.cell(rowIndex, 17).string((booking.User && booking.User.customer_name) || '').style(cellStyle);
      ws.cell(rowIndex, 18).string((booking.driver && booking.driver.driver_name) || '').style(cellStyle);
    });

    const excelFilePath = 'booking_data.xlsx';
    wb.write(excelFilePath);

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      'BOOKING.created_excel_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(bookingData_excel)', err);
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

// csv
exports.bookingData_csv = async (req, res) => {
  try {
    const data = await booking.find({}).populate('user driver').exec();
    const csvFilePath = 'booking_data.csv';

    const formattedData = data.map((booking) => ({
      pickup_location: booking.pickup_location || '',
      drop_location: booking.drop_location || '',
      trip_cost: booking.trip_cost,
      duration: booking.duration || '',
      distance: booking.distance || '',
      truck_type: booking.truck_type || '',
      booking_status: booking.booking_status || '',
      booking_cancel_reason_customer: booking.booking_cancel_reason_for_customer || '',
      booking_cancel_reason_driver: booking.booking_cancel_reason_for_driver || '',
      total_company_share: booking.total_company_share,
      total_earning_by_driver: booking.total_earning_by_driver,
      payment_type: booking.payment_type || '',
      OTP: booking.OTP || '',
      created_at: booking.created_at || '',
      updated_at: booking.updated_at || '',
      total_discount: booking.total_discount,
      user_name: (booking.user && booking.user.customer_name) || '', 
      driver_name: (booking.driver && booking.driver.driver_name) || '', 
      
    }));

    // Create a CSV writer
    const csvWriter = createCsvWriter({
      path: csvFilePath,
      header: [
        { id: 'pickup_location', title: 'Pickup Location' },
        { id: 'drop_location', title: 'Drop Location' },
        { id: 'trip_cost', title: 'Trip Cost' },
        { id: 'duration', title: 'Duration' },
        { id: 'distance', title: 'Distance' },
        { id: 'truck_type', title: 'Truck Type' },
        { id: 'booking_status', title: 'Booking Status' },
        { id: 'booking_cancel_reason_customer', title: 'Booking Cancel Reason (Customer)' },
        { id: 'booking_cancel_reason_driver', title: 'Booking Cancel Reason (Driver)' },
        { id: 'total_company_share', title: 'Total Company Share' },
        { id: 'total_earning_by_driver', title: 'Total Earning by Driver' },
        { id: 'payment_type', title: 'Payment Type' },
        { id: 'OTP', title: 'OTP' },
        { id: 'created_at', title: 'Created At' },
        { id: 'updated_at', title: 'Updated At' },
        { id: 'total_discount', title: 'Total Discount' },
        { id: 'user_name', title: 'User Name' }, // User name
        { id: 'driver_name', title: 'Driver Name' }, // Driver name
      ],
    });

    await csvWriter.writeRecords(formattedData);

    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.CREATED,
      constants.STATUS_CODE.SUCCESS,
      'BOOKING.created_csv_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(bookingData_csv)', err);
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
exports.bookingData_pdf = async (req, res) => {
  try {
    const data = await booking.find({}).populate('user driver').exec();

    const pdfFilePath = 'booking_data.pdf';

    const pdfDoc = new PDFDocument();
    const stream = fs.createWriteStream(pdfFilePath);
    pdfDoc.pipe(stream);

    pdfDoc.fontSize(12);
    pdfDoc.fillColor('black');

    data.forEach((booking) => {
      pdfDoc.fillColor('black');
      pdfDoc.font('Helvetica-Bold').text('Pickup Location: ').font('Helvetica').text(booking.pickup_location);
      pdfDoc.font('Helvetica-Bold').text('Drop Location: ').font('Helvetica').text(booking.drop_location);
      pdfDoc.font('Helvetica-Bold').text('Trip Cost: ').font('Helvetica').text(booking.trip_cost.toString());
      pdfDoc.font('Helvetica-Bold').text('Duration: ').font('Helvetica').text(booking.duration);
      pdfDoc.font('Helvetica-Bold').text('Distance: ').font('Helvetica').text(booking.distance);
      pdfDoc.font('Helvetica-Bold').text('Truck Type: ').font('Helvetica').text(booking.truck_type);
      pdfDoc.font('Helvetica-Bold').text('Booking Status: ').font('Helvetica').text(booking.booking_status);
      pdfDoc.font('Helvetica-Bold').text('Booking Cancel Reason (Customer): ').font('Helvetica').text(booking.booking_cancel_reason_for_customer);
      pdfDoc.font('Helvetica-Bold').text('Booking Cancel Reason (Driver): ').font('Helvetica').text(booking.booking_cancel_reason_for_driver);
      pdfDoc.font('Helvetica-Bold').text('Total Company Share: ').font('Helvetica').text(booking.total_company_share.toString());
      pdfDoc.font('Helvetica-Bold').text('Total Earning by Driver: ').font('Helvetica').text(booking.total_earning_by_driver.toString());
      pdfDoc.font('Helvetica-Bold').text('Payment Type: ').font('Helvetica').text(booking.payment_type);
      pdfDoc.font('Helvetica-Bold').text('OTP: ').font('Helvetica').text(booking.OTP);
      pdfDoc.font('Helvetica-Bold').text('Created At: ').font('Helvetica').text(booking.created_at);

      if (booking.updated_at) {
        pdfDoc.font('Helvetica-Bold').text('Updated At: ').font('Helvetica').text(booking.updated_at);
      } else {
        pdfDoc.font('Helvetica-Bold').text('Updated At: N/A');
      }

      pdfDoc.font('Helvetica-Bold').text('Total Discount: ').font('Helvetica').text(booking.total_discount.toString());

      if (booking.user) {
        pdfDoc.font('Helvetica-Bold').text('User Name: ').font('Helvetica').text(booking.user.customer_name || 'N/A');
      } else {
        pdfDoc.font('Helvetica-Bold').text('User Name: N/A');
      }

      if (booking.driver) {
        pdfDoc.font('Helvetica-Bold').text('Driver Name: ').font('Helvetica').text(booking.driver.driver_name || 'N/A');
      } else {
        pdfDoc.font('Helvetica-Bold').text('Driver Name: N/A');
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
      'BOOKING.booking_data_pdf_file',
      {},
      req.headers.lang
    );
  } catch (err) {
    console.log('Error(bookingData_pdf)', err);
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