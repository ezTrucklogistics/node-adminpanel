var express = require("express");

const {
  booking_confirm,
  booking_cancel_by_customer,
  booking_cancel_by_driver,
  Booking_otp_verify,
  create_Booking,
  createbooking_offline ,
  List_of_Booking_by_customers,
  List_of_Booking_by_drivers,
  total_amount_by_company_share,
  total_earning_by_driver ,
  search_all_the_earning_by_driver,
  earningsLast24HoursByDriver,
  earningsLastMonthByDriver ,
  earningsLastYearByDriver 
} = require("../controllers/booking.controller");

var router = express.Router();
const { authenticate, driver_authenticate } = require("../../middleware/authenticate");
const {
  booking_validator,
  booking_validation_result,
  booking_otp_verify_validator,
  List_of_Booking_by_drivers_validator,
  List_of_Booking_by_customers_validator,
  booking_confirm_validator
} = require("../../validation/booking.validation");



router.post( "/create_new_booking", booking_validator, booking_validation_result, authenticate, create_Booking);
router.post("/booking_offilne",booking_validator, booking_validation_result, createbooking_offline );
router.put("/booking_cancel_by_customer",authenticate,booking_cancel_by_customer);
router.put("/booking_cancel_by_driver",driver_authenticate,booking_cancel_by_driver);
router.put( "/booking_confirm/:bookingId/:driverId", authenticate, booking_confirm);
router.post("/booking_otp_verify" ,booking_otp_verify_validator, booking_validation_result, Booking_otp_verify)
router.get('/List_booking_by_customer' , List_of_Booking_by_customers_validator, booking_validation_result, List_of_Booking_by_customers)
router.get('/List_booking_by_drivers' , List_of_Booking_by_drivers_validator, booking_validation_result, List_of_Booking_by_drivers)
router.put('/booking_confirmed/:bookingId/:driverId' , booking_confirm_validator, booking_validation_result, booking_confirm)
router.get('/total_company_share', total_amount_by_company_share);
router.get('/total_earning_by_driver/:driverId',total_earning_by_driver )
router.get('/search_all_the_driver_earning_money',search_all_the_earning_by_driver)
router.get('/day_earning',earningsLast24HoursByDriver)
router.get('/month_earning',earningsLastMonthByDriver)
router.get('/year_earning',earningsLastYearByDriver)


module.exports = router;
