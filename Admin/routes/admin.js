var express = require("express");
var router = express.Router();
const { authenticate } = require("../../middleware/authenticate");
const{
    validateAdminCreation ,
    validationResult 
}= require("../../validation/admin.validation")

const{
signUpAdmin
}=require("../../Admin/controller/adminController")

router.post("/signUp_admin",validateAdminCreation, validationResult,authenticate ,signUpAdmin);
