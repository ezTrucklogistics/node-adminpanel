var express = require("express");

const {
  booking_confirm,
  booking_cancel_by_customer,
  booking_cancel_by_driver,
  Booking_otp_verify,
  create_Booking,
  List_of_Booking_by_customers,
  List_of_Booking_by_drivers,
} = require("../controllers/booking.controller");
var router = express.Router();
const { authenticate, driver_authenticate } = require("../../middleware/authenticate");
const {
  booking_validator,
  booking_validation_result,
  get_booking_by_id,
} = require("../../validation/booking.validation");


/**
 * @swagger
 * /v1/book/create_new_booking:
 *   post:
 *     summary: Create a new Booking
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pickup_location:
 *                 type: string
 *               drop_location:
 *                 type: string
 *               truck_type:
 *                 type: string
 *             required:
 *               - pickup_location
 *               - drop_location
 *               - truck_type
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Bad Request
 */


router.post(
  "/create_new_booking",
  booking_validator,
  booking_validation_result,
  authenticate,
  create_Booking
);



/**
 * @swagger
 * /v1/book/booking_cancel_by_customer/{bookingId}:
 *   put:
 *     summary: Get booking by ID
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the booking to retrieve
 *     responses:
 *       200:
 *         description: driver sucessfully cancel the book
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Booking not found
 */


router.put(
  "/booking_cancel_by_customer",
  authenticate,
  booking_cancel_by_customer
);


/**
 * @swagger
 * /v1/book/booking_cancel_by_driver/{bookingId}:
 *   put:
 *     summary: Get booking by ID
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the booking to retrieve
 *     responses:
 *       200:
 *         description: driver sucessfully cancel the book
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Booking not found
 */

router.put(
  "/booking_cancel_by_driver",
  driver_authenticate,
  booking_cancel_by_driver
);


/**
 * @swagger
 * /v1/book/booking_confirm/{bookingId}/{driverId}:
 *   put:
 *     summary: Get booking by ID
 *     tags: [Booking]
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the booking to retrieve
 *     responses:
 *       200:
 *         description: driver sucessfully confirm the book
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Booking not found
 */


router.put(
  "/booking_confirm/:bookingId/:driverId",
  authenticate,
  booking_confirm
);


/**
 * @swagger
 * /v1/book/booking_otp_verify:
 *   post:
 *     summary: OTP verify sucessfylly
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               OTP:
 *                 type: string
 *             required:
 *               - OTP
 *     responses:
 *       200:
 *         description:  OTP verify sucessfylly
 *       400:
 *         description: Bad Request
 */

router.post("/booking_otp_verify" , Booking_otp_verify)

/**
 * @swagger
 * /v1/book/distance_by_driver_customer:
 *   post:
 *     summary: sucessfully get distance by customer to driver
 *     tags: [Booking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               driver_current_location:
 *                 type: string
 *             required:
 *               - driver_current_location
 *     responses:
 *       200:
 *         description:  sucessfully get distance by customer to driver
 *       400:
 *         description: Bad Request
 */

router.get('/List_booking_by_customer' , List_of_Booking_by_customers)
router.get('/List_booking_by_drivers' , List_of_Booking_by_drivers)
router.put('/booking_confirmed/:bookingId/:driverId' , booking_confirm)




module.exports = router;
