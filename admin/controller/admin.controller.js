
const { sendResponse } = require('../../services/common.service')
const constants = require('../../config/constants');
const admin = require('../../models/admin.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dateFormat = require("../../helper/dateformat.helper");
const { isValid } = require("../../services/blackListMail");



exports.signUp = async (req, res, next) => {

    try {

        const reqBody = req.body;
        
        const checkMail = await isValid(reqBody.email)

        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();

        const user = await admin.create(reqBody)

        return sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS.SUCCESS, 'CUSTOMER.admin_signup', user , req.headers.lang);

    } catch (err) {
        console.log("err(admin_signUp)", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.login = async (req, res) => {

    const { email, password } = req.body;

    try {

            const admins = await admin.findOne({ email: email, deleted_at: null });
            let newToken = await admins.generateAuthToken();
            let refreshToken = await admins.generateRefreshToken();
        
            admins.authTokens = newToken;
            admins.refresh_tokens = refreshToken;
            admins.save();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.admin_login', admins, req.headers.lang);
    } catch (err) {
        console.log("err(admin_login)", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.logout = async (req, res) => {

    try {

        let adminData = await admin.findById(req.user._id);
        console.log(adminData)
        adminData.authTokens = null
        adminData.refresh_tokens = null
        await adminData.save()

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'CUSTOMER.admin_logout', {}, req.headers.lang);
    } catch (err) {
        console.log("err(admin_logout)", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}