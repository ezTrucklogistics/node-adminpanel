var express = require('express');
var router = express.Router();
const { body } = require('express-validator');


const authenticate = require('../../middleware/authenticate');
const { user_validator,
  login_validator,
  changePassword_validator,
  forgotPassword_validator,
  socialLogin_validator,
  restPassword_validator,
  update_validator
 } = require('../../validation/user.middleware')

const {validatorFunc, validatorFuncRender} = require('../../helper/commonFunction.helper'); 

const {
  signUp,
  login,
  emailVerify,
  forgotPassword,
  changePassword,
  resetPassword,
  getProfile,
  editProfile,
  userSocialLogin,
  logout,
  resendMail,
  emailVerifyPage,
  deleteFbUser,
  generate_auth_tokens,
  Otp_Verify
} = require('../controllers/user.controller')


router.post('/signUp', user_validator,validatorFunc, signUp)
router.post('/login',login_validator, validatorFunc, login)
router.post('/user-social-login', socialLogin_validator,validatorFunc, userSocialLogin);
router.get('/otp-verify', Otp_Verify)
router.get('/email-verify', emailVerify)
router.post('/forgot-password', forgotPassword_validator, validatorFunc, forgotPassword)
router.post('/change-password', changePassword_validator,validatorFunc, authenticate, changePassword)
router.post('/reset-password', restPassword_validator,validatorFuncRender, resetPassword)
router.get('/',authenticate, getProfile)
router.put('/',authenticate, editProfile)
router.post('/resend-mail', forgotPassword_validator, validatorFunc, resendMail)
router.get('/logout',authenticate, logout)
router.get('/auth_tokens/:refresh_tokens', generate_auth_tokens)
router.post('/delete-user', deleteFbUser);

module.exports = router;
