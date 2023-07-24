var express = require("express");
const {
  Add_driver_detalis, List_of_driver, driver_account_actived
} = require("../controllers/driver.controller");
const {driver_validator , validation_result} = require("../../validation/driver.validator")
var router = express.Router();
const {upload} = require("../../middleware/multer")


 router.post("/add_driver_detalis",upload.single('file'), Add_driver_detalis);
 router.get("/List_of_driver", List_of_driver);
 router.put("/account_actived/:driverId", driver_account_actived);


module.exports = router;

