var express = require("express");

const {
  Booking,
  List_of_Booking,
  booking_By_Id,
  booking_confirm,
  booking_cancel_by_customer,
  booking_cancel_by_driver,
} = require("../controllers/booking.controller");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");
const {
  booking_validator,
  booking_validation_result,
  update_booking_cancel_by_customer,
  update_booking_cancel_by_driver,
  get_booking_by_id,
} = require("../../validation/booking.validation");

router.post(
  "/create_new_booking",
  booking_validator,
  booking_validation_result,
  authenticate,
  Booking
);
router.get("/List_of_booking", List_of_Booking);
router.get(
  "/Booking_By_Id/:bookingId",
  get_booking_by_id,
  booking_validation_result,
  booking_By_Id
);
router.put(
  "/booking_cancel_by_customer/:bookingId",
  update_booking_cancel_by_customer,
  booking_validation_result,
  authenticate,
  booking_cancel_by_customer
);

router.put(
  "/booking_cancel_by_driver/:bookingId",
  update_booking_cancel_by_driver,
  booking_validation_result,
  authenticate,
  booking_cancel_by_driver
);

router.put(
  "/booking_confirm/:bookingId/:driverId",
  authenticate,
  booking_confirm
);

module.exports = router;
