const jwt = require("jsonwebtoken");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const ExcelJs = require("exceljs");
const path = require('path')
const fs = require("fs");
const { isValid } = require("../../services/blackListMail");
const pdfMake = require('pdfmake');
const {
  subscribeUserToTopic,
  unsubscribeUserFromTopic,
} = require("../../helper/notifications.helper");

const {
  generate_customer_Id,
  generate_otp,
} = require("../../middleware/common.function");
const {
  getUser,
  getUserDetails,
  objectsave,
  objectVerifyToken,
  objectVerifyEmail,
  updateUser,
  updateUserById,
  deleteUser,
  Usersave,
} = require("../services/user.service");

const constants = require("../../config/constants");
const { JWT_SECRET } = require("../../keys/keys");

const { GENERAL, USER } = require("../../lang/en/message");
const { stubFalse } = require("lodash");

exports.signUp = async (req, res) => {
  try {
    const reqBody = req.body;

    const { email, mobile_number, customer_name } = reqBody;

    const checkMail = await isValid(reqBody.email);

    if (checkMail == false)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: GENERAL.blackList_mail,
      });

    const existMobile = await User.findOne({ mobile_number });

    if (existMobile) {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "Mobile number already exist",
      });
    }

    const existEmail = await User.findOne({ email });

    if (existEmail) {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "Email already exist",
      });
    }

    reqBody.customer_Id = generate_customer_Id();
    reqBody.created_at = await dateFormat.set_current_timestamp();
    reqBody.updated_at = await dateFormat.set_current_timestamp();
    reqBody.authTokens = await jwt.sign(
      {
        data: reqBody.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    //
    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;
    let file = req.file;
    reqBody.profile_img = file.originalname;
    const user = await Usersave(reqBody);

    user.user_type = undefined;
    user.device_token = undefined;
    user.device_type = undefined;
    user.OTP = undefined;
    user.refresh_tokens = undefined;
    user.authTokens = undefined;
    user.deleted_at = undefined;
    user.__v = undefined;
    user._id = undefined;

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: USER.signUp_success,
      user,
    });
  } catch (err) {
    console.log("Error(Signup)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const userId = req.user._id;
    let UserData = await User.findById(userId);

    UserData.authTokens = null;
    UserData.refresh_tokens = null;

    await UserData.save();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: USER.logout_success,
      data: UserData.mobile_number,
    });
  } catch (err) {
    console.log("Error(logout)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile_number } = req.body;
    let user = await User.findOne({ mobile_number });
    console.log(user);

    if (user.user_type == 1)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "Your are not user please enter user mobile !",
      });
    if (user == 1)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: USER.mobile_number_not_found,
      });
    if (user.status == 0)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: USER.inactive_account,
      });
    if (user.status == 2)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: USER.deactive_account,
      });
    if (user.deleted_at != null)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: USER.inactive_account,
      });

    let newToken = await user.generateAuthToken();
    let refreshToken = await user.generateRefreshToken();

    user.OTP = generate_otp();
    user.authTokens = newToken;
    await user.save();
    user.user_type = undefined;
    user.device_token = undefined;
    user.device_type = undefined;
    user.OTP = undefined;
    user.refresh_tokens = undefined;
    user.authTokens = undefined;
    user.deleted_at = undefined;
    user.status = undefined;
    user.profile_img = undefined;
    user.customer_Id = undefined;
    user.__v = undefined;
    user._id = undefined;
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: USER.login_success,
      user,
    });
  } catch (err) {
    console.log("Error(Login)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.Otp_Verify = async (req, res) => {
  try {
    const { OTP } = req.body;
    console.log(OTP);
    const user = req.user;
    console.log(user);
    if (OTP != user.OTP) {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "otp not match",
      });
    }
    let newAuthToken = await user.generateAuthToken();
    user.authTokens = newAuthToken;
    user.OTP = "";
    await user.save();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: "otp verify scucessfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.generate_auth_tokens = async (req, res) => {
  try {
    const refresh_tokens = req.params.refresh_tokens;

    let user = await User.findOne({ refresh_tokens: refresh_tokens });

    console.log("user....", user);
    let newToken = await user.generateAuthToken();
    user.authTokens = newToken;
    user.save();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: USER.get_user_auth_token,
    });
  } catch (err) {
    console.log(err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.get_all_customer = async (req, res) => {
  try {
    let customer = await User.find(
      {},
      {
        user_type: 0,
        device_token: 0,
        device_type: 0,
        OTP: 0,
        refresh_tokens: 0,
        authTokens: 0,
        deleted_at: 0,
        __v: 0,
        _id: 0,
      }
    )
      .limit(30)
      .skip(30);

    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: "get all customer list",
      customer,
    });
  } catch (err) {
    console.log("Error(get_all_customer)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.update_customer_detalis = async (req, res) => {
  try {
    const reqBody = req.body;
    const { email, customer_name, mobile_number } = reqBody;

    const findUser = req.user._id;

    if (!findUser)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "user not found",
      });

    let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
      new: true,
    });

    if (!user)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "user data not found",
      });

    user.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: "sucessfully update user detalis",
      user,
    });
  } catch (err) {
    console.log("Error(update_customer_detalis)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.customer_account_actived = async (req, res) => {
  try {
    const reqBody = req.body;
    const { status } = reqBody;

    const findUser = req.user._id;

    if (!findUser)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "user not found",
      });

    let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
      new: true,
    });

    if (!user)
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({
        status: constants.STATUS_CODE.FAIL,
        message: "user data not found",
      });

    user.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      message: "sucessfully actived customer account",
      user,
    });
  } catch (err) {
    console.log("Error(customer_account_actived)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.export_customer_data_into_excel_file = async (req, res) => {
  try {
    const users = await User.find({ user_type: 2 });
    const workbook = new ExcelJs.Workbook();
    const worksheet = workbook.addWorksheet("My Users");
    worksheet.columns = [
      { header: "customer_Id", key: "customer_Id", width: 15 },
      { header: "profile_img", key: "profile_img", width: 20 },
      { header: "customer_name", key: "customer_name", width: 30 },
      { header: "mobile_number", key: "mobile_number", width: 30 },
      { header: "status", key: "status", width: 30 },
      { header: "email", key: "email", width: 30 },
      { header: "created_at", key: "created_at", width: 30 },
      { header: "updated_at", key: "updated_at", width: 30 },
    ];
    let count = 1;
    users.forEach((user) => {
      user.s_no = count;
      worksheet.addRow(user);
      count += 1;
    });
    worksheet.getRow(1).eachCell((cell) => {
      cell.font = { bold: true };
    });
    await workbook.xlsx.writeFile("customer.xlsx");

    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      msg: "new excelfile created",
    });
  } catch (err) {
    console.log("Error( export_customer_data_into_excel_file)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};

exports.customer_file_export_into_csv_file = async (req, res) => {
  try {
    const users = await User.find({ user_type: 2 });
    const csvData = users.map(
      (user) =>
        `${user.customer_Id},${user.email},${user.customer_name},${user.mobile_number}, ${user.status},${user.profile_img},${user.created_at},${user.updated_at}`
    );
    const csvContent = `customer_Id,email,customer_name,mobile_number,status,profile_img,created_at,updated_at\n${csvData.join(
      "\n"
    )}`;

    fs.writeFile("customerData.csv", csvContent, (error) => {
      if (error) {
        console.error("Error creating CSV file:", error);
      } else {
        return res.status(constants.WEB_STATUS_CODE.OK).send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "new csvfile created",
        });
      }
    });
  } catch (err) {
    console.log("Error(customer_file_export_into_csv_file)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};


exports.customer_file_export_into_pdf_file = async (req, res) => {

  try {
    
    const users = await User.find({ user_type: 2 })
  
    const docDefinition = {
      content: [
        { text: "Customer Data", style: "header" },
        { text: "\n" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*"],
            body: [
              [
                "customer_Id",
                "email",
                "customer_name",
                "proflile_img",
                "status",
                "mobile_number",
                "created_at",
                "updated_at",
              ],
              ...users.map((user) => [
                user.customer_Id,
                user.email,
                user.customer_name,
                user.status,
                user.mobile_number,
                user.profile_img,
                user.created_at,
                user.updated_at,
              ]),
            ],
          },
        },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          font: 'Roboto',
        },
      },
      defaultStyle: {
        font: 'Roboto', // Specify the default 'Roboto' font for the entire document
      },
    };

    const printer = new pdfMake();
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    pdfDoc.pipe(fs.createWriteStream('file.pdf'));
    pdfDoc.end();
    return res.status(constants.WEB_STATUS_CODE.OK).send({
      status: constants.STATUS_CODE.SUCCESS,
      msg: "PDF file created successfully",
    });


  } catch (err) {
    console.log("Error(customer_file_export_into_csv_file)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.FAIL,
      message: GENERAL.general_error_content,
    });
  }
};
