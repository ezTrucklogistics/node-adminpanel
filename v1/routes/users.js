var express = require("express");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");

const {
  login_validator,
  validation_result,
  update_customer_validator,
  user_validator, 

} = require("../../validation/user.validator");
const {contact_validator , update_contact_validator} = require("../../validation/contact.validator")


const {
  signUp,
  login,
  logout,
  update_customer,
  create_contacts,
  update_contact,
  get_customer,
  
} = require("../controllers/user.controller");



router.post(
  "/signUp",
  user_validator , validation_result,
  signUp
);

router.post("/login", login_validator, validation_result, login);
router.get("/logout", authenticate, logout);
router.get('/get_customer' ,authenticate, get_customer);
router.put(
  "/update_customer_detalis",
   update_customer_validator,
   validation_result,
  authenticate,
  update_customer
);
router.post('/create_contact' , contact_validator, validation_result, authenticate, create_contacts)
router.put('/update_contact' , update_contact_validator , validation_result , update_contact)


module.exports = router;
