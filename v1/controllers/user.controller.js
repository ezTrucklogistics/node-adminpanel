const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const {
    check,
    validationResult
} = require('express-validator');
const {
    responseMessage,
    sendResponse
} = require('../../services/common.service')
const dateFormat = require('../../helper/dateformat.helper');
const User = require('../../models/user.model')

const {
    isValid
} = require('../../services/blackListMail')


const {
    subscribeUserToTopic,
    unsubscribeUserFromTopic 
} =  require('../../helper/notifications.helper');


const {
    getUser,
    getUserDetails,
    Usersave,
    userVerifyToken,
    userVerifyEmail,
    updateUser,
    updateUserById,
    deleteUser

} = require('../services/user.service');

const sendEmail = require('../../services/email.service');
const Keys = require('../../keys/keys')
const constants = require('../../config/constants')
const {
    JWT_SECRET
} = require('../../keys/keys');
const {
    constant
} = require('lodash');

exports.signUp = async (req, res, next) => {
    try {
        const reqBody = req.body

        const checkMail = await isValid(reqBody.email)

        if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

        let existingUser = await getUser(reqBody.email, 'email');

        if (existingUser && existingUser.verify_token == true) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_already_exist', {}, req.headers.lang);
        }

        if (existingUser && existingUser.verify_token == false) {
            await deleteUser(existingUser._id)
        }
        reqBody.password = await bcrypt.hash(reqBody.password, 10);
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();
        reqBody.tempTokens = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })
        //
        reqBody.device_type = (reqBody.device_type) ? reqBody.device_type : null
        reqBody.device_token = (reqBody.device_token) ? reqBody.device_token : null
        const user = await Usersave(reqBody);

        let verifyUrl = `${Keys.BASEURL}v1/users/account-verify?user_id=${user._id}&emailVerificationToken=${reqBody.tempTokens}`

        let sendMail = {
            'to': reqBody.email,
            'templateSlug': constants.EMAIL_TEMPLATE.WELCOME_MAIL,
            'data': {
                verifyUrl: verifyUrl
            }
        }

        let isSendEmail = await sendEmail(req, sendMail);
        if (isSendEmail) {
            console.log('email has been sent');
        } else {
            console.log('email has not been sent', user._id);
            await deleteUser(user._id)
            return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', 'Error in sending mail', req.headers.lang)
        }

        let resData = user

        delete resData.reset_password_token;
        delete resData.reset_password_expires;
        delete resData.first_name;
        delete resData.last_name;
        delete resData.password;
        resData.tokens = ''

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.signUp_success', resData, req.headers.lang);

    } catch (err) {
        console.log("Error(Signup)", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.logout = async (req, res, next) => {
    
    try {
        const reqBody = req.user
        let UserData = await User.findById(reqBody._id)
        
        await unsubscribeUserFromTopic({deviceType: UserData.device_type, deviceToken: UserData.device_token, userData: req.user });

        
        UserData.tokens = null
        UserData.refresh_tokens = null

        await UserData.save()
        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.logout_success', {}, req.headers.lang);

    } catch (err) {
        console.log("Error(logout)", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.login = async (req, res, next) => {

    try {

        const reqBody = req.body
        console.log("reqBody...", reqBody)
        let user = await User.findOne(reqBody.mobile_number);

        console.log("user...", user)

        if (user == 1) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_not_found', {}, req.headers.lang);
        if (user == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalid_password', {}, req.headers.lang);

        if (user.verify_token == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.not_verify_account', {}, req.headers.lang);
        if (user.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        if (user.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);

        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken()

        user.device_type = (reqBody.device_type) ? reqBody.device_type : null
        user.device_token = (reqBody.device_token) ? reqBody.device_token : null

        if(device_type && device_token){
            
           await subscribeUserToTopic({device_type, device_token, userData: user})
        }


        await user.save()

        let resData = user
        resData.tokens = '';

        delete resData.reset_password_token;
        delete resData.reset_password_expires;
        delete resData.password;
        resData.tokens = newToken

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.login_success', resData, req.headers.lang);

    } catch (err) {
        console.log('Error(Login)', err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.Otp_Verify = async (req, res, next) => {

    try {

        let message
        const userId = req.query.user_id
        const emailVerificationToken = req.query.emailVerificationToken
        const data = await userVerifyToken(userId, emailVerificationToken)
        if (data == 1) {
            res.redirect(Keys.BASEURL + `v1/users/email-verify/verify?user_id=${userId}`)
        } else {
            res.redirect(Keys.BASEURL + `v1/users/email-verify/unverify?user_id=${userId}`)
        }
    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.emailVerify = async (req, res, next) => {
    try {
        const userId = req.query.user_id
        const emailVerificationToken = req.query.emailVerificationToken
        const email = req.query.email

        const data = await userVerifyEmail(userId, emailVerificationToken, email)
        if (data == 1) {
            message = req.flash(
                'success',
                `Your email has been verified successfully.`
            );

            return res.render('message', {
                req: req,
                logoUrl: Keys.BASEURL + `images/logo/logo.png`,
                appBaseUrl: Keys.BASEURL,
                constants: constants,
                message: 'message',
                error: req.flash('error'),
                success: req.flash('success'),
            });
        } else {
            message = req.flash(
                'error',
                'Your account verify link expire or invalid'
            );

            return res.render('message', {
                req: req,
                logoUrl: Keys.BASEURL + `images/logo/logo.png`,
                appBaseUrl: Keys.BASEURL,
                constants: constants,
                message: 'message',
                error: req.flash('error'),
                success: req.flash('success'),
            });
            // sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.account_verify_fail', data, req.headers.lang);
        }
    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.forgotPassword = async (req, res, next) => {
    try {

        const reqBody = req.body
        let existingUser = await getUser(reqBody.email, 'email');

        if (!existingUser) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'USER.email_not_found', {}, req.headers.lang);
        }

        let updated_at = await dateFormat.set_current_timestamp();
        reset_password_token = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })

        // let tempTokens = Math.floor(Math.random() * 10000000)
        let updateData = {
            updated_at: updated_at,
            reset_password_token: reset_password_token
        }


        let conditionData = {
            email: reqBody.email
        }

        const user = await updateUser(conditionData, updateData);

        let sendMail = {
            'to': reqBody.email,
            'lang': existingUser.lang,
            'templateSlug': constants.EMAIL_TEMPLATE.PASSWORD_RESET,
            'data': {
                userName: existingUser.first_name,
                url: Keys.BASEURL + 'v1/web/reset-password?token=' + reset_password_token
            }
        }

        let isSendEmail = await sendEmail(req, sendMail);
        if (isSendEmail) {
            console.log('email has been sent');
        } else {
            console.log('email has not been sent');
        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.forgotPassword_email_success', user, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.changePassword = async (req, res, next) => {
    try {

        const reqBody = req.body

        if (reqBody.new_password !== reqBody.confirm_password) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.password_mismatch', {}, req.headers.lang)

        let userDetails = await User.findById(req.user._id);

        if (!userDetails.validPassword(reqBody.old_password)) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.invalidOldPassword', {}, req.headers.lang)

        userDetails.password = await bcrypt.hash(reqBody.new_password, 10);
        userDetails.updated_at = await dateFormat.set_current_timestamp();

        const changePassword = updateUser({
            _id: userDetails._id
        }, userDetails)

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.passwordUpdate_success', changePassword, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.resetPassword = async (req, res, next) => {
    try {

        const reqBody = req.body

        if (reqBody.new_password !== reqBody.confirm_password) {

            message = req.flash(
                'error',
                'New password and confirm password not matched.'
            );

            return res.redirect(
                Keys.BASEURL + 'v1/web/reset-password?token=' + reqBody.reset_password_token
            );
        }


        let userDetails = await getUser(reqBody.reset_password_token, "reset_password_token");

        if (!userDetails) {
            message = req.flash(
                'error',
                'Your account verify link expire or invalid.'
            );

            return res.render('message', {
                req: req,
                logoUrl: Keys.BASEURL + `images/logo/logo.png`,
                appBaseUrl: Keys.BASEURL,
                constants: constants,
                message: 'message',
                error: req.flash('error'),
                success: req.flash('success'),
            });
        }

        userDetails.password = await bcrypt.hash(reqBody.new_password, 10);
        userDetails.updated_at = await dateFormat.set_current_timestamp();
        userDetails.reset_password_token = null

        const changePassword = updateUser({
            reset_password_token: reqBody.reset_password_token
        }, userDetails)

        // sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.passwordUpdate_success', changePassword, req.headers.lang);

        message = req.flash(
            'success',
            'Your password successfully changed.'
        );

        return res.render('message', {
            req: req,
            logoUrl: Keys.BASEURL + `images/logo/logo.png`,
            appBaseUrl: Keys.BASEURL,
            constants: constants,
            message: 'message',
            error: req.flash('error'),
            success: req.flash('success'),
        });

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



exports.getProfile = async (req, res, next) => {
    try {
        let resData = req.user
        resData.tokens = '';

        resData.height = resData.height == null ? resData.height : (resData.height).toFixed(2)
        resData.weight = resData.weight == null ? resData.weight : (resData.weight).toFixed(2)

        delete resData.reset_password_token;
        delete resData.reset_password_expires;
        delete resData.password;

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_profile', resData, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.editProfile = async (req, res, next) => {
    try {
        const reqBody = req.body
        console.log("reqBody......", reqBody)
        reqBody.cityId = reqBody.cityId ? reqBody.cityId : null

        let is_email_changed_obj = {
            is_email_changed: false
        }

        if (reqBody.age) reqBody.signup_status = 2
        if (reqBody.skill_level) reqBody.signup_status = 0

        if (reqBody.email) {
            const checkMail = await isValid(reqBody.email)
            if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

            if (reqBody.email != req.user.email) {
                is_email_changed_obj.is_email_changed = true

                reqBody.is_email_changed = true

                let existingUser = await getUser(reqBody.email, 'email');

                if (existingUser && existingUser.verify_token == true) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.email_already_exist', {}, req.headers.lang);

                reqBody.tempTokens = await jwt.sign({
                    data: reqBody.email
                }, JWT_SECRET)

                let verifyUrl = `${Keys.BASEURL}v1/users/emailVerify?user_id=${req.user._id}&emailVerificationToken=${reqBody.tempTokens}&email=${reqBody.email}`

                let sendMail = {
                    'to': reqBody.email,
                    'templateSlug': constants.EMAIL_TEMPLATE.CONFIRM_MAIL,
                    'data': {
                        // userName: reqBody.first_name,
                        verifyUrl: verifyUrl
                    }
                }

                let isSendEmail = await sendEmail(req, sendMail);

            }
        }

        if (reqBody.user_name && reqBody.user_name != req.user.user_name) {
            let existingUser = await getUser(reqBody.user_name, 'user_name');
            if (existingUser) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.user_name_already_exist', {}, req.headers.lang);
        }



        reqBody.email = req.user.email
        reqBody.updated_at = await dateFormat.set_current_timestamp();

        const updateUserData = await updateUser({
            _id: req.user._id
        }, reqBody)
        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.profile_update_success', is_email_changed_obj, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.contactUs = async (req, res) => {
    try {
        const contactUs = new ContactUs(req.body)
        contactUs.created_at = await dateFormat.set_current_timestamp();
        contactUs.updated_at = await dateFormat.set_current_timestamp();
        contactUs.user_id = req.user._id

        let data = await contactUs.save()

        // await sendEmail(contactUs.email, commanMessage.ADMIN.contact_req_mail_subject, contactRequestTemplate({ email: contactUs.email, username: contactUs.username, subject: contactUs.subject, query: contactUs.query }));

        sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS, 'CONTACTUS.query_created_success', data, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.notificationSettings = async (req, res, next) => {
    try {
        const userNotification = req.user.notification_settings
        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_notificatuon_setting', userNotification, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.userSocialLogin = async (req, res, next) => {
    try {

        let reqBody = req.body
        reqBody.device_type = (reqBody.device_type) ? reqBody.device_type : null
        reqBody.device_token = (reqBody.device_token) ? reqBody.device_token : null

        let user = await User.findOne({
            social_id: reqBody.social_id,
            social_type: reqBody.social_type
        });
        let userRegister

        if (!user) {

            if (reqBody.email) {
                const checkMail = await isValid(reqBody.email)
                if (checkMail == false) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'GENERAL.blackList_mail', {}, req.headers.lang);

            }
            let existingUser = await getUser(reqBody.email, 'email');

            if (existingUser) {
                console.log("heyy")
                existingUser.social_id = reqBody.social_id
                existingUser.social_type = reqBody.social_type
                existingUser = await dateFormat.set_current_timestamp();

                user = await existingUser.save()
            } else {
                reqBody.verify_token = true
                reqBody.updated_at = await dateFormat.set_current_timestamp()
                reqBody.created_at = await dateFormat.set_current_timestamp()
                user = await Usersave(reqBody);
                userRegister = true
            }
        } else {

            user.device_type = (reqBody.device_type) ? reqBody.device_type : null
            user.device_token = (reqBody.device_token) ? reqBody.device_token : null
            await user.save()
        }

        console.log("user...", user)

        if (user.status == 0) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);
        if (user.status == 2) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.deactive_account', {}, req.headers.lang);
        if (user.deleted_at != null) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.inactive_account', {}, req.headers.lang);


        if(device_type && device_token){
            await subscribeUserToTopic({device_type, device_token, userData: user})
         }

        let newToken = await user.generateAuthToken();

        let resData = user

        delete resData.reset_password_token;
        delete resData.reset_password_expires;
        delete resData.password;
        resData.tokens = newToken

        resData.height = resData.height == null ? resData.height : (resData.height).toFixed(2)
        resData.weight = resData.weight == null ? resData.weight : (resData.weight).toFixed(2)

        resData.userRegister = userRegister == true ? true : false

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.social_login_success', resData, req.headers.lang, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}




exports.resendMail = async (req, res, next) => {
    try {

        const reqBody = req.body
        let existingUser = await getUser(reqBody.email, 'email');

        if (!existingUser) {
            return sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND, 'USER.email_not_found', {}, req.headers.lang);
        }

        if (existingUser && existingUser.verify_token == true) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'USER.account_already_verify', {}, req.headers.lang);
        }

        let updated_at = await dateFormat.set_current_timestamp();

        tempTokens = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })

        let updateData = {
            updated_at: updated_at,
            tempTokens: tempTokens
        }

        let conditionData = {
            email: reqBody.email
        }

        const user = await updateUser(conditionData, updateData);
        let verifyUrl = `${Keys.BASEURL}v1/users/account-verify?user_id=${existingUser._id}&emailVerificationToken=${tempTokens}`

        let sendMail = {
            'to': reqBody.email,
            'templateSlug': constants.EMAIL_TEMPLATE.RESEND_MAIL,
            'data': {
                // userName: reqBody.first_name,
                verifyUrl: verifyUrl
            }
        }


        let isSendEmail = await sendEmail(req, sendMail);
        if (isSendEmail) {
            console.log('email has been sent');
        } else {
            console.log('email has not been sent');
        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.resend_email_success', user, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


exports.deleteFbUser = async (req, res) => {
    let reqdata = req.body;
  
    let encoded_data = reqdata.signed_request.split('.', 2);
  
    // decode the data
    let sig = encoded_data[0];
    let json = base64decode(encoded_data[1]);
    let data = JSON.parse(json);
    let fb_id = data.user_id;
  
    let findFBUser = await User.findOne({
      facebookSocialId: fb_id,
    });
  
    // const deletedNotif = await Notification.deleteMany({
    //   _userId: findFBUser._id,
    // });
  
    let user_id = findFBUser._id;
    const _doctorObjectId = mongoose.Types.ObjectId(user_id);
  
    console.log(user_id);
    console.log(fb_id);

  
    // User
    const deleteUser = await User.deleteOne({
      _id: user_id,
    });
  
    const newData = new DeletedAccount({});
  
    newData.deletedAt = dateTimeFunc.setCurrentTimestamp();
    newData.facebookId = fb_id;
  
    const code = await generate6DigitNumber();
    newData.code = code;
    let addedAccount = await newData.save();
  
    res.status(200).send({
      confirmation_code: code,
      url: `${appBaseUrl}/web/verify-user-code-form?facebookId=${fb_id}`,
    });
  };

  
  exports.generate_auth_tokens = async (req, res, next) => {
    try {
        const refresh_tokens = req.params.refresh_tokens

        let user = await User.findOne({ refresh_tokens:refresh_tokens })

        console.log("user....",user)

        let newToken = await user.generateAuthToken();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'USER.get_user_auth_token', newToken, req.headers.lang);

    } catch (err) {
        console.log(err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}