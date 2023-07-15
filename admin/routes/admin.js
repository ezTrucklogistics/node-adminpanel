var express = require('express');
var router = express.Router();

const { login_validator,changePassword_validator } = require('../../validation/user.validator')
const { verifyAccessToken } = require('../../middleware/admin.middleware')

const {
  login,
  logout,
  refreshToken,
  changePassword,
  forgotPassword,
  getAllUsersProfile,
  activateDeactivateUser,
  deleteUser,
  getAllUsersExcel
} = require('../controllers/admin.controller')

//router.post('/login', login_validator,validatorFunc, login)
//router.post('/logout', logout)
// router.post('/refresh-token', refresh_token, refreshToken)
//router.get('/get-all-users-excel', verifyAccessToken, getAllUsersExcel);

module.exports = router;


// mongosh "mongodb+srv://cluster0.4mscd.mongodb.net/myFirstDatabase" --username commonApp
// mongodb+srv://commonApp:<password>@cluster0.4mscd.mongodb.net/test