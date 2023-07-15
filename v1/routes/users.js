var express = require('express');
var router = express.Router()
const {authenticate} = require("../../middleware/authenticate")
const {
  login_validator,validation_result , update_customer_validator
 } = require('../../validation/user.validator')
 
const {upload} = require("../../middleware/multer")

const {
  signUp,
  login,
  generate_auth_tokens,
  Otp_Verify,
  logout,
  get_all_customer,
  update_customer_detalis,
  customer_account_actived
} = require('../controllers/user.controller')


router.post('/signUp', upload.single("file") ,  signUp)
router.post('/login', login)
router.get("/logout" , authenticate,  logout)
router.post('/otp-verify',authenticate, Otp_Verify)
router.get('/auth_tokens/:refresh_tokens', generate_auth_tokens)
router.get("/List_of_customer" , get_all_customer);
router.put("/update_customer_detalis" , authenticate , update_customer_detalis)
router.put("/account_actived" , authenticate , customer_account_actived)


module.exports = router;
