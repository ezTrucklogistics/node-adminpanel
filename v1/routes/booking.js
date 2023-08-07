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
const { authenticate, driver_authenticate } = require("../../middleware/authenticate");
const {
  booking_validator,
  booking_validation_result,
  update_booking_cancel_by_customer,
  update_booking_cancel_by_driver,
  get_booking_by_id,
} = require("../../validation/booking.validation");


/**
 * @swagger
 * https://fexmy.co/v1/book/create_new_booking:
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
  Booking
);


/**
 * @swagger
 * https://fexmy.co/v1/book/List_of_booking:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Booking]
 *     responses:
 *       200:
 *         description: The list of the books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 * */


router.get("/List_of_booking", List_of_Booking);

/**
 * @swagger
 * https://fexmy.co/v1/book/Booking_By_Id/{bookingId}:
 *   get:
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
 *         description: Successfully retrieved the booking
 *       400:
 *         description: Bad Request
 *       404:
 *         description: Booking not found
 */

router.get(
  "/Booking_By_Id/:bookingId",
  get_booking_by_id,
  booking_validation_result,
  booking_By_Id
);



/**
 * @swagger
 * https://fexmy.co/v1/book/booking_cancel_by_customer/{bookingId}:
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
  "/booking_cancel_by_customer/:bookingId",
  update_booking_cancel_by_customer,
  booking_validation_result,
  authenticate,
  booking_cancel_by_customer
);


/**
 * @swagger
 * https://fexmy.co/v1/book/booking_cancel_by_driver/{bookingId}:
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
  "/booking_cancel_by_driver/:bookingId",
  update_booking_cancel_by_driver,
  booking_validation_result,
  authenticate,
  booking_cancel_by_driver
);


/**
 * @swagger
 * https://fexmy.co/v1/book/booking_confirm/{bookingId}/{driverId}:
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



module.exports = router;
