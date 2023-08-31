var express = require("express");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");

const {
  login_validator,
  validation_result,
  update_customer_validator,
  user_validator, 
  refresh_token__validator,
  get_all_customer_validator,
  update_Roles_validator,
  account_verify_validator
} = require("../../validation/user.validator");


const {
  signUp,
  login,
  generate_auth_tokens,
  logout,
  get_all_customer,
  export_customer_data_into_excel_file,
  customer_file_export_into_csv_file,
  update_Role,
  update_customer,
  delete_customer,
  accountVerify,
  
} = require("../controllers/user.controller");





 /**
 * @swagger
 * tags:
 *   name: Customers
 *   description: API for managing customers
 */

/**
 * @swagger
 * /v1/users/signUp:
 *   post:
 *     summary: Signup a new user
 *     tags: [Customers]
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
 *         description: User signed up successfully
 *       400:
 *         description: Bad Request
 */

router.post(
  "/signUp",
  user_validator , validation_result,
  signUp
);

/**
 * @swagger
 * /v1/users/login:
 *   post:
 *     summary: customer login sucessfully
 *     tags: [Customers]
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
 *         description: User signed up successfully
 *       400:
 *         description: Bad Request
 */

router.post("/login", login_validator, validation_result, login);

/**
 * @swagger
 * /v1/users/logout:
 *   get:
 *     summary: Logout the customer
 *     tags: [Customers]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema:
 *           type: string
 *         required: true
 *         description: Customer's access token
 *     responses:
 *       200:
 *         description: Customer logged out successfully
 *       401:
 *         description:  Unauthorized - Token not provided or invalid
 */

router.get("/logout", authenticate, logout);

/**
 * @swagger
 * /v1/users/auth_tokens/{refresh_token}:
 *   get:
 *     summary: Generate authentication tokens using a refresh token
 *     tags: [Customers]
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

router.get(
  "/auth_tokens/:refresh_tokens",
  generate_auth_tokens, refresh_token__validator
);

/**
 * @swagger
 * /v1/users/List_of_customer:
 *   get:
 *     summary: Returns the list of all the customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: The list of the customers
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 * */

router.get("/List_of_customer",get_all_customer_validator , validation_result , get_all_customer);

/**
 * @swagger
 * /v1/users/update_customer_details:
 *   put:
 *     summary: Update customer details
 *     tags: [Customers]
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

router.put(
  "/update_customer_detalis",
   update_customer_validator,
   validation_result,
  authenticate,
  update_customer
);


/**
 * @swagger
 * /v1/users/customer_data_export_excel:
 *   post:
 *     summary: create new excel file
 *     tags: [Customers]
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

router.post("/customer_data_export_excel" , export_customer_data_into_excel_file)


/**
 * @swagger
 * /v1/users/customer_data_export_csv:
 *   post:
 *     summary: create new csv file
 *     tags: [Customers]
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
router.post("/customer_data_export_csv" , customer_file_export_into_csv_file)

/**
 * @swagger
 * /v1/users/get_customer_by_id/{customerId}:
 *   get:
 *     summary: Returns the get the customers
 *     tags: [Customers]
 *     responses:
 *       200:
 *         description: get customers detalis
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 * */

router.delete("/delete_customer_account" , authenticate , delete_customer)
router.put('/update_roles', update_Roles_validator , validation_result ,  update_Role)
router.get('/account_verify' , account_verify_validator , validation_result, accountVerify)

module.exports = router;
