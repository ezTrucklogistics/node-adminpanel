var express = require("express");
const {
  driver_signup,
  login,
  logout,
  generate_auth_tokens,
  update_driver_detalis,
  get_all_driver,
  driver_account_actived,
  export_driver_data_into_excel_file,
  driver_file_export_into_csv_file,
} = require("../controller/driver.controller");
const {
  driver_validator,
  validation_result,
} = require("../../validation/driver.validator");
var router = express.Router();
const { driver_authenticate } = require("../../middleware/authenticate");

router.post("/driver_signup", driver_signup);
router.post("/login", login);
router.get("/logout", driver_authenticate, logout);
router.get("/auth_tokens/:refresh_tokens", generate_auth_tokens);
router.get("/List_of_driver", get_all_driver);
router.put("/driver_status_actived", driver_authenticate , driver_account_actived );
router.put("/update_driver_detalis" ,driver_authenticate, update_driver_detalis)
router.post("/driver_data_export_excel" , export_driver_data_into_excel_file)
router.post("/driver_data_export_csv" , driver_file_export_into_csv_file)



module.exports = router;
