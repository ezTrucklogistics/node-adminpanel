var express = require("express");
const {
  Booking,
  List_of_Booking,
  booking_cancel,
  booking_By_Id,
  booking_confirm,
} = require("../controllers/booking.controller");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");


router.post("/create_new_booking", authenticate, Booking);
router.get("/List_of_booking", List_of_Booking);
router.get("/Booking_By_Id/:bookingId", booking_By_Id);
router.put("/booking_cancel", authenticate, booking_cancel);
router.put("/booking_confirm" ,authenticate , booking_confirm )

module.exports = router;
