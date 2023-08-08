const express = require("express");
const {signup,
  login,
  logout,
  generate_auth_tokens,
  update_driver_detalis,
  get_all_driver,
  driver_account_actived,
  export_driver_data_into_excel_file,
  driver_file_export_into_csv_file,
  driver_total_earning,
  driver_daily_earning,
  delete_driver_detalis,
} = require("../controller/driver.controller");
 const {login_validator , validation_result} = require("../../validation/driver.validator")
var router = express.Router();
const { driver_authenticate  } = require("../../middleware/authenticate");


/**
 * @swagger
 * /v1/driver/signUp:
 *   post:
 *     summary: Signup a new driver
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               customer_name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *     responses:
 *       201:
 *         description: driver signed up successfully
 *       400:
 *         description: Bad Request
 */

router.post("/signup", signup);

/**
 * @swagger
 * /v1/driver/login:
 *   post:
 *     summary: driver login sucessfully
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *             properties:
 *               mobile_number:
 *                 type: string
 *     responses:
 *       200:
 *         description: Driver Login successfully
 *       400:
 *         description: Bad Request
 */


router.post("/login",login_validator, validation_result, login);

/**
 * @swagger
 * /v1/driver/logout:
 *   get:
 *     summary: Logout the Driver
 *     tags: [Drivers]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Driver's access token
 *     responses:
 *       200:
 *         description: Driver logged out successfully
 *       401:
 *         description:  Unauthorized - Token not provided or invalid
 */

router.get("/logout", driver_authenticate, logout);

/**
 * @swagger
 * /v1/driver/auth_tokens/{refresh_token}:
 *   get:
 *     summary: Generate authentication tokens using a refresh token
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: refresh_token
 *         schema:
 *           type: string
 *         required: true
 *         description: The refresh token used to generate new authentication tokens
 *     responses:
 *       200:
 *         description: Authentication tokens generated successfully
 *       400:
 *         description: Bad Request
 */


router.get("/auth_tokens/:refresh_tokens", generate_auth_tokens);

/**
 * @swagger
 * /v1/driver/List_of_driver:
 *   get:
 *     summary: Returns the list of all the books
 *     tags: [Drivers]
 *     responses:
 *       200:
 *         description: The list of the drivers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 * */

router.get("/List_of_driver", get_all_driver);

/**
 * @swagger
 * /v1/driver/driver_status_actived:
 *   put:
 *     summary: driver_status details
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *     responses:
 *       200:
 *         description:  successfully updated driver_status
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 */


router.put("/driver_status_actived", driver_authenticate , driver_account_actived );

/**
 * @swagger
 * /v1/driver/update_driver_detalis:
 *   put:
 *     summary: Update customer details
 *     tags: [Drivers]
 *     parameters:
 *       - in: path
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Bearer token for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               customer_name:
 *                 type: string
 *               mobile_number:
 *                 type: string
 *             required:
 *               - email
 *               - customer_name
 *               - mobile_number
 *     responses:
 *       200:
 *         description: Customer details updated successfully
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized - Token not provided or invalid
 */


router.put("/update_driver_detalis" ,driver_authenticate, update_driver_detalis)

/**
 * @swagger
 * /v1/driver/driver_data_export_excel:
 *   post:
 *     summary: create new excel file
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description:  successfully create a new excel file
 *       400:
 *         description: Bad Request
 */


router.post("/driver_data_export_excel" , export_driver_data_into_excel_file)

/**
 * @swagger
 * /v1/driver/driver_data_export_csv:
 *   post:
 *     summary: create new csv file
 *     tags: [Drivers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/x-www-form-urlencoded:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description:  successfully create a new csv file
 *       400:
 *         description: Bad Request
 */

router.post("/driver_data_export_csv" , driver_file_export_into_csv_file)
router.post("/driver_total_earning" ,driver_authenticate, driver_total_earning)
router.post("/driver_daily_earning" , driver_daily_earning)
router.delete("/driver_account_deleted" , driver_authenticate, delete_driver_detalis)


module.exports = router;
