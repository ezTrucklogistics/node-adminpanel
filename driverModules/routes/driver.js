const express = require("express");
const {signup,
  login,
  logout,
  update_driver_detalis,
  driver_account_actived,
  update_current_location,
  delete_driver,
} = require("../controller/driver.controller");
 const {login_validator , update_current_location_validator, validation_result } = require("../../validation/driver.validator")
var router = express.Router();
const { driver_authenticate  } = require("../../middleware/authenticate");




router.post("/signup", signup);
router.post("/login",login_validator, validation_result, login);
router.get("/logout", driver_authenticate, logout);
router.put("/driver_status_actived", driver_authenticate , driver_account_actived );
router.put("/update_driver_detalis" ,driver_authenticate, update_driver_detalis)
router.delete("/driver_account_deleted" , driver_authenticate, delete_driver)
router.put('/driver_current_location_update' , update_current_location_validator, validation_result , update_current_location)





module.exports = router;
