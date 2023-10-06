var express = require("express");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");
const {
  login_validator,
  validation_result,
  update_customer_validator,
  user_validator,
} = require("../../validation/user.validator");
const { contact_validator, update_contact_validator , get_contacts_validator } = require("../../validation/contact.validator")
const {
  signUp,
  login,
  logout,
  update_customer,
  create_contacts,
  update_contact,
  change_mobile_number,
  get_all_customer,
  get_contacts,
  userData_excel,
  userData_csv,
  userData_pdf
} = require("../controllers/user.controller");





router.post("/signUp",user_validator, validation_result, signUp);
router.post("/login", login_validator, validation_result, login);
router.get("/logout", authenticate, logout);
router.post('/change_mobileNumber' , authenticate , change_mobile_number)
router.put("/update_customer_detalis",update_customer_validator,validation_result,authenticate,update_customer);
router.post('/create_contact', contact_validator, validation_result, authenticate, create_contacts)
router.put('/update_contact', update_contact_validator, validation_result, update_contact);
router.get('/get_contacts/:contactId' , get_contacts_validator , validation_result , get_contacts)
router.get('/get_all_customers' , get_all_customer)
router.post('/create_excel_file' , userData_excel);
router.post('/user_export_into_csv_file' , userData_csv)
router.post('/user_export_into_pdf_file' , userData_pdf)




module.exports = router;
