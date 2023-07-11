const EmailFormat = require('../../models/emailTemplate.model');
const dateFormat = require('../../helper/dateformat.helper');
const constants = require('../../config/constants');
const { sendResponse } = require('../../services/common.service');
const { EMAIL } = require('../../lang/en/message');


//create email template
exports.createEmailTemplate = async (req, res) => {

    try {
        let reqdata = req.body;

        var emailTemplateTitle = (reqdata.title).trim()
        var regex = new RegExp('^' + emailTemplateTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        var isTemplateExist = await EmailFormat.findOne({ title: { $regex: regex } });

        if (isTemplateExist) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'EMAIL.title_already_exists', {}, req.headers.lang);


        /*var getId = await EmailFormat.aggregate([{$group : {_id : null, id_max : {$max : "$id"}}}]);
        if(getId.length<=0){
            var id = 0;    
        }else{
            var id = getId[0].id_max+1;
        }*/

        emailFormat = new EmailFormat();
        emailFormat.id = reqdata.id;
        emailFormat.title = reqdata.title;
        emailFormat.keys = reqdata.keys;
        emailFormat.subject = reqdata.subject;
        emailFormat.body = reqdata.body;
        emailFormat.status = reqdata.status;
        emailFormat.slug = reqdata.slug;
        emailFormat.createdAt = await dateFormat.set_current_timestamp();
        emailFormat.updatedAt = await dateFormat.set_current_timestamp();

        let emailFormatData = await emailFormat.save();

        sendResponse(res, constants.WEB_STATUS_CODE.CREATED, constants.STATUS_CODE.SUCCESS,'EMAIL.email_format_created_success', emailFormatData, req.headers.lang);

        // logService.responseData(req, emailFormatData);

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//get single Email Template
exports.getSingleEmailTemplate = async (req, res) => {

    try {
        const emailTemplate = await EmailFormat.findById(req.params.id)

        if (!emailTemplate) {
            sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND,'EMAIL.no_email_format_exists', {}, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS,'EMAIL.email_template_retrieve', emailTemplate, req.headers.lang);
        }

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//get all Email Templates
exports.getAllEmailTemplate = async (req, res) => {
    try {
        let lang = req.params.lang ? req.params.lang : constants.LANG.ENGLISH

        console.log("lang...",lang)
        let emailTemplateData = await EmailFormat.find({lang}).collation({ locale: "en" });

        if (emailTemplateData.length <= 0) {
            sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND,'EMAIL.no_email_format_exists', {}, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS,'EMAIL.email_template_retrieve', emailTemplateData, req.headers.lang);
        }

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//update email template
exports.updateEmailTemplate = async (req, res) => {

    try {
        let reqdata = req.body;

        emailFormatData = await EmailFormat.findById(req.params.id)

        if (!emailFormatData) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL,'EMAIL.no_email_format_exists', {}, req.headers.lang);

        var emailTemplateTitle = (reqdata.title).trim()
        var regex = new RegExp('^' + emailTemplateTitle.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');
        var isTemplateTitle = await EmailFormat.findOne({
            title: { $regex: regex }, _id: {
                $ne: req.params.id
            },
        });

        if (isTemplateTitle) return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL,'EMAIL.title_already_exists', {}, req.headers.lang);

        emailFormatData.title = reqdata.title;
        emailFormatData.keys = reqdata.keys;
        emailFormatData.subject = reqdata.subject;
        emailFormatData.body = reqdata.body;
        emailFormatData.status = reqdata.status;
        emailFormatData.createdAt = await dateFormat.set_current_timestamp();
        emailFormatData.updatedAt = await dateFormat.set_current_timestamp();

        let updatedEmailFormatData = await emailFormatData.save();

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS,'EMAIL.email_format_updated_success', updatedEmailFormatData, req.headers.lang);

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//delete Email Template
exports.deleteEmailTemplate = async (req, res) => {

    try {
        const deletedEmailTemplate = await EmailFormat.findByIdAndDelete(req.params.id)

        if (!deletedEmailTemplate) {
            sendResponse(res, constants.WEB_STATUS_CODE.NOT_FOUND, constants.STATUS_CODE.NOT_FOUND,'EMAIL.no_email_format_exists', {}, req.headers.lang);
        } else {
            sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS,'EMAIL.email_template_deleted', deletedEmailTemplate, req.headers.lang);
        }

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}