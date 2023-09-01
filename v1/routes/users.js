var express = require("express");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");

const {
  login_validator,
  validation_result,
  update_customer_validator,
  user_validator, 
  update_Roles_validator,

} = require("../../validation/user.validator");


const {
  signUp,
  login,
  logout,
  update_Role,
  update_customer,

  
} = require("../controllers/user.controller");




router.post(
  "/signUp",
  user_validator , validation_result,
  signUp
);
router.post("/login", login_validator, validation_result, login);
router.get("/logout", authenticate, logout);
router.put(
  "/update_customer_detalis",
   update_customer_validator,
   validation_result,
  authenticate,
  update_customer
);

router.put('/update_roles', update_Roles_validator , validation_result ,  update_Role)
// router.get('/account_verify' , account_verify_validator , validation_result, accountVerify)




module.exports = router;
