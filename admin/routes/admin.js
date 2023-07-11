var express = require('express');
var router = express.Router();

const { login_validator,changePassword_validator } = require('../../validation/user.middleware')
const { verifyAccessToken } = require('../../middleware/admin.middleware')
const {validatorFunc} = require('../../helper/commonFunction.helper'); 

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

router.post('/login', login_validator,validatorFunc, login)
router.post('/logout', logout)
// router.post('/refresh-token', refresh_token, refreshToken)
router.post('/changePassword', changePassword_validator, validatorFunc, changePassword)
router.post('/forgotPassword', validatorFunc,forgotPassword)
router.get('/get-all-users', getAllUsersProfile);
router.put('/active-deactive-user/:id', activateDeactivateUser);
router.delete('/delete-user/:id', deleteUser);
router.get('/get-all-users-excel', verifyAccessToken, getAllUsersExcel);

module.exports = router;


// mongosh "mongodb+srv://cluster0.4mscd.mongodb.net/myFirstDatabase" --username commonApp
// mongodb+srv://commonApp:<password>@cluster0.4mscd.mongodb.net/test