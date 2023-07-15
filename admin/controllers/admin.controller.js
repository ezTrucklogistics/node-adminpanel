const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const fs = require('fs');
const Keys = require('../../keys/keys')


const { sendResponse } = require('../../services/common.service')
const dateFormat = require('../../helper/dateformat.helper');

const { getUser, save } = require('../services/admin.service');
const constants = require('../../config/constants');

const User = require('../../models/user.model');
// const auth = require('../../middleware/auth.middleware')

const forgotPasswordTemplate = require('../services/emailTemplate/forgotPasswordTemplate');
const excel = require('node-excel-export');

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email: email, deleted_at: null });

        if (!user) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_username_password', {}, req.headers.lang);
        }
        if (!user.validPassword(password)) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_username_password', {}, req.headers.lang);
        }
        if (user.user_type !== constants.USER_TYPE.ADMIN) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.unauthorized_user', {}, req.headers.lang);
        }

        await user.generateAuthToken();
        await user.generateRefreshToken();

        sendResponse(res, constants.WEB_STATUS_CODE.SUCCESS, constants.STATUS_CODE.SUCCESS, 'USER.login_success', user, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.logout = async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        
        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.refreshToken = async (req, res) => {

    try {
        const { refreshToken } = req.body

        const user = await verifyRefreshToken(refreshToken)
        if (!user) sendResponse(res, constants.WEB_STATUS_CODE.UNAUTHORIZED, constants.STATUS_CODE.UNAUTHENTICATED, 'GENERAL.unauthorized_user', {}, req.headers.lang)

        await user.generateAuthToken();
        await user.generateRefreshToken();
        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', user, req.headers.lang);
    } catch (error) {
        console.log("err........", error)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}