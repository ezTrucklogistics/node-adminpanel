const jwt = require("jsonwebtoken");
const dateFormat = require("../../helper/dateformat.helper");
const User = require("../../models/user.model");
const ExcelJs = require("exceljs");
const fs = require("fs");
const { isValid } = require("../../services/blackListMail");
const { generateId } = require("../../middleware/common.function");
const { Usersave } = require("../services/user.service");
const constants = require("../../config/constants");
const { JWT_SECRET } = require("../../keys/keys");
const driver = require("../../models/driver.model");



exports.signUp = async (req, res) => {
  try {
    const reqBody = req.body;

    const { email, mobile_number, customer_name } = reqBody;

    const checkMail = await isValid(reqBody.email);

    if (checkMail == false)
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          msg: "EMAIL FORMATE NOT CORRECT",
        });

    const existMobile = await User.findOne({ mobile_number });

    if (existMobile) {
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          msg: "MOBILE NUMBER ALREADY EXIST",
        });
    }

    reqBody.customer_Id = generateId();
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

    return res
      .status(constants.WEB_STATUS_CODE.CREATED)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CUSTOMER SIGNUP SUCESSFULLY",
        user,
      });
  } catch (err) {
    console.log("Error(Signup)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
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
    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CUSTOMER LOGOUT SUCESSFULLY",
      });
  } catch (err) {
    console.log("Error(logout)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};

exports.login = async (req, res) => {
  try {
    const { mobile_number } = req.body;

    let user = await User.findOne({ mobile_number });

    if (!user)
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "CUSTOMER NOT FOUND",
        });

    if (user.user_type == 1)
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "YOUR NOT CUSTOMER",
        });

    let newToken = await user.generateAuthToken();
    let refreshToken = await user.generateRefreshToken();

    await User.findByIdAndUpdate(
      user._id,
      {
        $set: { status: constants.STATUS.ACCOUNT_ACTIVE },
      },
      { new: true }
    );

    user.authTokens = newToken;
    user.refresh_tokens = refreshToken;
    await user.save();

    user.user_type = undefined;
    user.device_token = undefined;
    user.device_type = undefined;
    user.refresh_tokens = undefined;
    user.deleted_at = undefined;
    user.__v = undefined;
    user._id = undefined;

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CUSTOMER LOGIN SUCESSFULLY",
        user,
      });
  } catch (err) {
    console.log("Error(Login)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};


exports.update_Role = async (req, res) => {

  try {
    
    const { email } = req.query;
    let reqBody = req.body;
    const { user_type } = reqBody;
    let Roles = await driver.findOneAndUpdate({driver_email : email}, reqBody , {new:true})

    if(!Roles){

        return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status: constants.STATUS_CODE.FAIL  ,message:"DRIVER NOT FOUND"})
    }
    
    let users = new User({

        email:Roles.driver_email,
        customer_name:Roles.driver_name,
        mobile_number:Roles.driver_mobile_number,
        authTokens:Roles.authTokens,
        refresh_tokens:Roles.refresh_tokens,
        status:Roles.status,
        user_type:Roles.user_type
    })

    await users.save();

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "ROLE CHANGED SUCESSFULLY",
        
      });

  } catch (err) {
    console.log("Error(update_Role)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};

exports.generate_auth_tokens = async (req, res) => {
  try {
    const { refresh_tokens } = req.params;

    const verified = jwt.verify(refresh_tokens, JWT_SECRET);
    console.log(verified);

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

    let token = await user.save();

    return res
      .status(constants.WEB_STATUS_CODE.CREATED)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CREATE NEW AUTH TOKEN",
        data: token.authTokens,
      });
  } catch (err) {
    console.log("Error(generate_auth_tokens)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
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
        refresh_tokens: 0,
        authTokens: 0,
        deleted_at: 0,
        __v: 0,
        _id: 0,
      }
    )
      .limit(10)
      .skip(10);

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "SUCESSFULLY GET ALL CUSTOMER ",
        customer,
      });
  } catch (err) {
    console.log("Error(get_all_customer)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};



exports.get_customer_by_id = async (req, res) => {
  try {
    let { customerId } = req.query;

    let customers = await User.findOne({ _id: customerId });
    customers.refresh_tokens = undefined;
    customers.authTokens = undefined;
    customers.device_token = undefined;
    customers.device_type = undefined;
    customers.created_at = undefined;
    customers.updated_at = undefined;

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "SUCESSFULLY GET CUSTOMER ",
        customers,
      });
  } catch (err) {
    console.log("Error(get_customer_by_id)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};

exports.update_customer_detalis = async (req, res) => {
  try {
    const reqBody = req.body;

    const { email, customer_name, mobile_number } = reqBody;

    const findUser = req.user._id;

    if (!findUser)
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          msg: "CUSTOMER Id NOT FOUND",
        });

    let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
      new: true,
    });

    if (!user)
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          msg: "CUSTOMER DATA NOT FOUND",
        });

    user.updated_at = await dateFormat.set_current_timestamp();

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CUSTOMER DATA UPDATE SUCESSFULLY",
        data: {
          email: user.email,
          mobile_number: user.mobile_number,
          customer_name: user.customer_name,
        },
      });
  } catch (err) {
    console.log("Error(update_customer_detalis)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};

exports.delete_customer_detalis = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId)
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          msg: "CUSTOMER ID NOT FOUND",
        });

    let customerdata = await User.findByIdAndDelete(userId);

    if (!customerdata)
      return res
        .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
        .send({
          status: constants.STATUS_CODE.FAIL,
          msg: "CUSTOMER DATA NOT FOUND",
        });

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CUSTOMER DATA DELETE SUCESSFULLY",
      });
  } catch (err) {
    console.log("Error(delete_customer_detalis)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
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

    return res
      .status(constants.WEB_STATUS_CODE.OK)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "CREATE NEW EXCEL FILE",
      });
  } catch (err) {
    console.log("Error( export_customer_data_into_excel_file)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};

exports.customer_file_export_into_csv_file = async (req, res) => {
  try {
    const users = await User.find({ user_type: 2 });
    console.log(users);
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
        return res
          .status(constants.WEB_STATUS_CODE.CREATED)
          .send({
            status: constants.STATUS_CODE.SUCCESS,
            msg: "CREATE NEW CSV FILE",
          });
      }
    });
  } catch (err) {
    console.log("Error(customer_file_export_into_csv_file)", err);
    return res
      .status(constants.WEB_STATUS_CODE.SERVER_ERROR)
      .send({
        status: constants.STATUS_CODE.FAIL,
        msg: "Something went wrong. Please try again later.",
      });
  }
};
