const Version = require('../../models/version.model');
const User = require('../../models/user.model');
const dateFormat = require('../../helper/dateformat.helper');
const constants = require('../../config/constants');
const compareVersions = require('compare-versions');

const { sendResponse } = require('../../services/common.service')

const { sendNewVersionNotification } = require('../../helper/notifications.helper')


//create Version
exports.createVersion = async (req, res) => {
    try {
        console.log(">>>>>>>>>>>.")
        let reqdata = req.body;
        var version_number = (reqdata.version_number).trim()
        var regex = new RegExp('^' + version_number.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '$', 'i');

        var isVersionExist = await Version.findOne({ $and: [{ version_number: { $regex: regex } }, { device_type: reqdata.device_type }] });

        if (isVersionExist) {
            return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.version_already_exists', {}, req.headers.lang);
        }

        var isVersionLower = await Version.findOne({ device_type: reqdata.device_type }).sort({ created_at: -1 })

        console.log("isVersionLower...",isVersionLower)
        if (isVersionLower) {

            let latestVersion = isVersionLower.version_number;
            let isGreaterVersion = compareVersions.compare(version_number, latestVersion, '>');
            if (!isGreaterVersion) {
                return sendResponse(res, constants.WEB_STATUS_CODE.BAD_REQUEST, constants.STATUS_CODE.FAIL, 'ADMIN.version_number_lower', {}, req.headers.lang);
            }
        }

        version = new Version();
        version.version_number = reqdata.version_number;
        version.device_type = reqdata.device_type;
        version.is_force_update = reqdata.is_force_update;
        version.created_at = await dateFormat.set_current_timestamp();
        version.updated_at = await dateFormat.set_current_timestamp();

        let versionData = await version.save();
        if (versionData) {
            d_type = versionData.device_type;

            let allUsers = await User.find({'device_type': d_type}).select('email device_token').lean()

            await sendNotificationToTopic({topicName: topicName, deviceType: d_type})


        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.version_number_created_success', versionData, {}, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

//get all version number data
exports.getAllVersionData = async (req, res) => {

    try {


        let {
            is_star,
            limit,
            page,
            status,
            skill_level,
            sortBy,
            q
        } = req.query

        limit = +limit || constants.LIMIT;
        page = +page || constants.PAGE;

        const sort = {};
        let field = 'created_at';
        let value = 1;

        if (sortBy) {
            const parts = sortBy.split(':');
            field = parts[0];
            parts[1] === 'desc' ? value = -1 : value = 1;
        }

        let query = {}

        versionData = await Version.find(query)
        .sort({
            [field]: value
        })
        .limit(limit).skip((page - 1) * limit).lean();

        const totalVersion = await Version.count(query);

        let data = {
            versions: versionData,
            limit: limit,
            page: page,
            total: totalVersion
        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.get_version', data, req.headers.lang);




        // let versionData = [];

        // let latestVersionData = await Version.find({}).distinct("device_type");

        // for (let i = 0; i < latestVersionData.length; i++) {
        //     var updateVersionData = await Version.findOne({ device_type: latestVersionData[i] }).sort({ created_at: -1 })

        //     versionData.push(updateVersionData)
        // }
        // sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'ADMIN.get_version', versionData, req.headers.lang);

        // logService.responseData(req, versionData);

    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}

exports.getAppVersion = async (req, res) => {
    try {
        let reqdata = req.body
        let updateType = 0; //0=no update 1=force update 2=optional update

        let device_type = new RegExp(reqdata.device_type, 'i');
        let deviceVersion = reqdata.version_number;

        let message, updateStatus;

        let latestForceUpdate = await Version.findOne({ device_type, is_force_update: 1 }).sort({ created_at: -1 })

        if (latestForceUpdate) {
            let forceUpdateVersion = latestForceUpdate.version_number;
            let is_force_update = compareVersions.compare(forceUpdateVersion, deviceVersion, '>');

            if (is_force_update) {
                updateType = 1;
            }
        }

        if (updateType != 1) {
            let latestOptionalUpdate = await Version.findOne({ device_type, is_force_update: 0 }).sort({ created_at: -1 })

            if (latestOptionalUpdate) {
                let optionalUpdateVersion = latestOptionalUpdate.version_number;
                let isOptionalUpdate = compareVersions.compare(optionalUpdateVersion, deviceVersion, '>');

                if (isOptionalUpdate) {
                    updateType = 2;
                }
            }
        }

        if (updateType == 1) {
            message = 'ADMIN.version_force_update'
            updateStatus = constants.VERSION_STATUS.FORCE_UPDATE;
        }
        else if (updateType == 2) {
            message = 'ADMIN.version_force_update'
            updateStatus = constants.VERSION_STATUS.OPTIONAL_UPDATE;
        }
        else {
            message = 'ADMIN.version_no_update'
            updateStatus = constants.VERSION_STATUS.NO_UPDATE;
        }

        sendResponse(res, constants.WEB_STATUS_CODE.OK, STATUS_CODE.SUCCESS, message, updateStatus, req.headers.lang);
    } catch (err) {
        console.log("err........", err)
        sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}