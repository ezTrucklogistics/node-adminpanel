var express = require("express");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");

const {
  login_validator,
  validation_result,
  update_customer_validator,
  user_validator, 
  refresh_token__validator,
} = require("../../validation/user.validator");



const {
  signUp,
  login,
  generate_auth_tokens,
  logout,
  get_all_customer,
  update_customer_detalis,
  customer_account_actived,
  export_customer_data_into_excel_file,
  customer_file_export_into_csv_file,
  
} = require("../controllers/user.controller");


router.post(
  "/signUp",
  user_validator , validation_result,
  signUp
);
router.post("/login", login_validator, validation_result, login);
router.get("/logout", authenticate, logout);
router.get(
  "/auth_tokens/:refresh_tokens",
  generate_auth_tokens, refresh_token__validator
);
router.get("/List_of_customer", get_all_customer);
router.put(
  "/update_customer_detalis",
   update_customer_validator,
   validation_result,
  authenticate,
  update_customer_detalis
);
router.put(
  "/account_actived",
  authenticate,
  customer_account_actived
);

router.post("/customer_data_export_excel" , export_customer_data_into_excel_file)
router.post("/customer_data_export_csv" , customer_file_export_into_csv_file)


module.exports = router;
