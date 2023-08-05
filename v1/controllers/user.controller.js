const jwt = require("jsonwebtoken");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const ExcelJs = require("exceljs");
const fs = require("fs");
const { isValid } = require("../../services/blackListMail");
const {
  generate_Id,generateOTP 
} = require("../../middleware/common.function");
const {
  getUser,
  updateUser,
  deleteUser,
  Usersave,
} = require("../services/user.service");

const constants = require("../../config/constants");
const { JWT_SECRET } = require("../../keys/keys");
const {sendResponse} = require("../../services/common.service")



exports.signUp = async (req, res) => {

  try {
    
    const reqBody = req.body;

    const { email, mobile_number, customer_name } = reqBody;

    const checkMail = await isValid(reqBody.email);

    if (checkMail == false)
    return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , msg:"EMAIL FORMATE NOT CORRECT"})

    
    const existMobile = await User.findOne({ mobile_number });

    if (existMobile) {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , msg:"MOBILE NUMBER ALREADY EXIST" })
    }

    reqBody.customer_Id = generate_Id();
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

    reqBody.device_type = reqBody.device_type ? reqBody.device_type : null;
    reqBody.device_token = reqBody.device_token ? reqBody.device_token : null;
    const user = await Usersave(reqBody);
    user.user_type = undefined;
    user.device_token = undefined;
    user.device_type = undefined;
    user.refresh_tokens = undefined;
    user.authTokens = undefined;
    user.deleted_at = undefined;
    user.__v = undefined;
    user._id = undefined;

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , msg:"CUSTOMER SIGNUP SUCESSFULLY" , user})
    

  } catch (err) {
    console.log("Error(Signup)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};



exports.logout = async (req, res) => {

  try {

    const userId = req.user._id;
    let UserData = await User.findById(userId);

    UserData.authTokens = null;
    UserData.refresh_tokens = null;

    await UserData.save();
    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"CUSTOMER LOGOUT SUCESSFULLY"})

  } catch (err) {
    console.log("Error(logout)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};



exports.login = async (req, res) => {

  try {

    const { mobile_number } = req.body;
    let user = await User.findOne({ mobile_number });
    console.log(user);

    if (user.user_type == 1)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "Your are not a user"
      );

    if (user == 1)
      return sendResponse(
        res,
        constants.WEB_STATUS_CODE.BAD_REQUEST,
        constants.STATUS_CODE.FAIL,
        "USER. mobile_number_not_found"
      );

    let newToken = await user.generateAuthToken();
    let refreshToken = await user.generateRefreshToken();

    user.authTokens = newToken;
    await user.save();
    user.user_type = undefined;
    user.device_token = undefined;
    user.device_type = undefined;
    user.refresh_tokens = undefined;
    user.deleted_at = undefined;
    user.status = undefined;
    user.__v = undefined;
    user._id = undefined;

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"CUSTOMER LOGIN SUCESSFULLY" , user})
  } catch (err) {
    console.log("Error(Login)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

exports.generate_auth_tokens = async (req, res) => {

  try {

    const { refresh_tokens } = req.params;

    const verified = jwt.verify(refresh_tokens, JWT_SECRET);
    console.log(verified)

    let user = await User.findById(verified._id);
    user.authTokens = await jwt.sign(
      {
        data: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: constants.URL_EXPIRE_TIME,
      }
    );

    await user.save();

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , msg:"CREATE NEW AUTH TOKEN"})

  } catch (err) {
    console.log(err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
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
        refresh_tokens: 0,
        authTokens: 0,
        deleted_at: 0,
        __v: 0,
        _id: 0,
      }
    ).limit(10).skip(10)

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"SUCESSFULLY GET ALL CUSTOMER " , customer})

  } catch (err) {
    console.log("Error(get_all_customer)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.update_customer_detalis = async (req, res) => {

  try {

    const reqBody = req.body;
    const { email, customer_name, mobile_number } = reqBody;

    const findUser = req.user._id;

    console.log(findUser)

    if (!findUser) return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "CUSTOMER NOT FOUND "
    );

    let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
      new: true,
    });

    if (!user)
    return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "CUSTOMER DATA NOT FOUND"
    );

    user.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"CUSTOMER UPDATE SUCESSFULLY"})


  } catch (err) {
    console.log("Error(update_customer_detalis)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.delete_customer_detalis = async (req, res) => {

  try {

   const {  } = req.query;

    if (!customerId) return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , msg:"3 DIGIT OF CUSTOMER ENTER"})

    let customerdata = await User.findOneAndDelete({_id: customerId});

    if (!customerdata)
     return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , msg:"CUSTOMER DATA NOT FOUND"})

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , msg:"CUSTOMER DATA DELETE SUCESSFULLY" , customerdata})

  } catch (err) {
    console.log("Error(delete_customer_detalis)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};


exports.customer_account_actived = async (req, res) => {

  try {

    const findUser = req.user._id;

    if (!findUser)
       return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "USER DATA NOT FOUND "
    );;

    let user = await await User.findOneAndUpdate({ _id: findUser }, {
      $set:{status:constants.STATUS.ACCOUNT_ACTIVE}
   },{new:true});

    if (!user)
       return sendResponse(res,
      constants.WEB_STATUS_CODE.BAD_REQUEST,
      constants.STATUS_CODE.FAIL,
      "USER DATA NOT FOUND "
    );

    user.updated_at = await dateFormat.set_current_timestamp();
    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS,
      msg:"USER ACCOUNT SUCESSFULLY ACTIVED"})
    

  } catch (err) {
    console.log("Error(customer_account_actived)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
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

    return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS,
      msg:"CREATE NEW EXCEL FILE"})

  } catch (err) {
    console.log("Error( export_customer_data_into_excel_file)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};



exports.customer_file_export_into_csv_file = async (req, res) => {

  try {
    
    const users = await User.find({ user_type: 2 });
    console.log(users)
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
        return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , msg:"CREATE NEW CSV FILE"})
      }
    });
     
  } catch (err) {
    console.log("Error(customer_file_export_into_csv_file)", err);
    return sendResponse(
      res,
      constants.WEB_STATUS_CODE.SERVER_ERROR,
      constants.STATUS_CODE.FAIL,
      "GENERAL.general_error_content",
      err.message,
      req.headers.lang
    );
  }
};

