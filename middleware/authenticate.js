const jwt = require('jsonwebtoken');
const lang = require("../lang/en/message")
const User = require('../models/user.model');
const constants = require('../config/constants')
const { JWT_SECRET } = require('../keys/keys');
const driver = require("../models/driver.model")


//authenticate user
let authenticate = async (req, res, next) => {

    try {
        
        if (!req.header('Authorization')) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.unauthorized_user})

        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.invalid_token})

        const decoded = await jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ _id: decoded._id })
        if (!user) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.unauthorized_user})
    
        req.token = token;
        req.user = user;

        next();

    } catch (err) {
        console.log(err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.general_error_content})
    }
}


//authenticate user
let driver_authenticate = async (req, res, next) => {

    try {
        
        if (!req.header('Authorization')) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.unauthorized_user})

        const token = req.header('Authorization').replace('Bearer ', '');
        if (!token) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.invalid_token})

        const decoded = await jwt.verify(token, JWT_SECRET);
        const drivers = await driver.findOne({ _id: decoded._id })
        if (!drivers) return res.status(constants.WEB_STATUS_CODE.UNAUTHORIZED).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.unauthorized_user})
    
        req.token = token;
        req.drivers = drivers;

        next();

    } catch (err) {
        console.log(err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:lang.GENERAL.general_error_content})
    }
}




module.exports = {authenticate , driver_authenticate}