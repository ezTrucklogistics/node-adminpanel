const jwt = require('jsonwebtoken');
const lang = require("../lang/en/message")
const User = require('../models/user.model');
const constants = require('../config/constants')
const { JWT_SECRET } = require('../keys/keys');
const driver = require("../models/driver.model")
const {sendResponse} = require('../services/common.service')



//authenticate user
let authenticate = async (req, res, next) => {

    try {

        if (!req.header('Authorization')) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang);

        const token = req.header('Authorization').replace('Bearer ', '');
        console.log(token)
        if (!token) sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.not_token', {}, req.headers.lang)

        const decoded = await jwt.verify(token, JWT_SECRET);
        
        const user = await User.findOne({ _id: decoded._id}).lean();
        console.log(user)

        if (!user) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang)
        if (user.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'USER.inactive_account', {}, req.headers.lang);
        if (user.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'USER.deactive_account', {}, req.headers.lang);
        if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'USER.delete_account', {}, req.headers.lang);
      
        req.token = token;
        req.user = user;

        next();
    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
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