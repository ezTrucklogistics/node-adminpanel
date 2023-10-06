const Admin = require("../model/adminModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../../keys/keys");
const dateFormat = require("../../helper/dateformat.helper"); 
const { isValid } = require("../../services/blackListMail"); 
const { sendResponse } = require("../../services/common.service");
const constants = require("../../config/constants"); 
exports.signUpAdmin = async (req, res) => {
    try {
        const reqBody = req.body;
        const checkMail = await isValid(reqBody.email);
        if (checkMail === false)
            return sendResponse(
                res,
                constants.WEB_STATUS_CODE.BAD_REQUEST,
                constants.STATUS_CODE.FAIL,
                "GENERAL.blackList_mail",
                {},
                req.headers.lang
            );

        const existAdmin = await Admin.findOne({ email: reqBody.email });

        if (existAdmin)
            return sendResponse(
                res,
                constants.WEB_STATUS_CODE.BAD_REQUEST,
                constants.STATUS_CODE.FAIL,
                "Email already exists",
                {},
                req.headers.lang
            );

        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();

        // Hash the password
        const hashedPassword = await bcrypt.hash(reqBody.password, 10);

        reqBody.password = hashedPassword;
        
        reqBody.role = "Admin"; // Set the role as Admin
        
        // Create a new admin user
        const newAdmin = new Admin(reqBody);

        // Save the admin user to the database
        await newAdmin.save();

        // Generate a JWT token for authentication
        const token = jwt.sign(
            { adminId: newAdmin._id },
            JWT_SECRET,
            { expiresIn: constants.URL_EXPIRE_TIME }
        );

        // Clear sensitive fields from the response
        newAdmin.password = undefined;

        // Send the token and admin data in the response
        return sendResponse(
            res,
            constants.WEB_STATUS_CODE.CREATED,
            constants.STATUS_CODE.SUCCESS,
            "Admin registered successfully",
            { admin: newAdmin, token }
        );
    } catch (err) {
        console.error("Error(Signup)", err);
        return sendResponse(
            res,
            constants.WEB_STATUS_CODE.SERVER_ERROR,
            constants.STATUS_CODE.FAIL,
            "GENERAL.general_error_content",
            err.message
        );
    }
};
