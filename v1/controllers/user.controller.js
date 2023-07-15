
const jwt = require('jsonwebtoken');
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
   objectsave,
   objectVerifyToken,
   objectVerifyEmail,
    updateUser,
    updateUserById,
    deleteUser

} = require('../services/user.service');

// const sendEmail = require('../../services/email.service');
// const Keys = require('../../keys/keys')
const constants = require('../../config/constants')
const {
    JWT_SECRET
} = require('../../keys/keys');

const {
    constant
} = require('lodash');
const { GENERAL,object } = require('../../lang/en/message');
const accountSid = "AC468e6e390e9317d752e91c46c684e597"
const authToken = "783b6f8480e600827c235c3dc064c9d2"
const client = require('twilio')(accountSid , authToken)


exports.signUp = async (req, res) => {

    try {

        const reqBody = req.body

        const {email , mobile_number , customer_name} = reqBody;

        const checkMail = await isValid(reqBody.email)

        if (checkMail == false) return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.blackList_mail})

        const existMobile = awaitobject.findOne({mobile_number})

        if(existMobile){

             return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:"Mobile number already exist"})
        }

        const existEmail = awaitobject.findOne({email})

        if(existEmail){

             return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:"Email already exist"})
        }

        reqBody.customer_Id = Math.floor(Math.random() * 900) + 100;
        reqBody.created_at = await dateFormat.set_current_timestamp();
        reqBody.updated_at = await dateFormat.set_current_timestamp();
        reqBody.authTokens = await jwt.sign({
            data: reqBody.email
        }, JWT_SECRET, {
            expiresIn: constants.URL_EXPIRE_TIME
        })

        //
        reqBody.device_type = (reqBody.device_type) ? reqBody.device_type : null
        reqBody.device_token = (reqBody.device_token) ? reqBody.device_token : null
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
 
       return  res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , message:USER.signUp_success , user})

    } catch (err) {
        console.log("Error(Signup)", err)
       return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}



exports.logout = async (req, res) => {
    
    try {

        const userId = req.user._id
        let UserData = await User.findById(userId)

        UserData.authTokens = null
        UserData.refresh_tokens = null

        await UserData.save()
        return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:USER.logout_success ,data: UserData.mobile_number})

    } catch (err) {
        console.log("Error(logout)", err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}



exports.login = async (req, res) => {

    try {

        
        const {mobile_number} = req.body
        let user = await User.findOne({mobile_number});
        console.log(user)
        
        if(user.user_type == 1)  return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:"Your are not user please enter user mobile !"})
        if (user == 1)   return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:USER.mobile_number_not_found})
        if (user.status == 0)   return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:USER.inactive_account})
        if (user.status == 2)   return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:USER.deactive_account})
        if (user.deleted_at != null)  return  res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:USER.inactive_account})

        let newToken = await user.generateAuthToken();
        let refreshToken = await user.generateRefreshToken()

        // user.device_type = (reqBody.device_type) ? reqBody.device_type : null
        // user.device_token = (reqBody.device_token) ? reqBody.device_token : null

        // if(device_type && device_token){
        //    await subscribeUserToTopic({device_type, device_token, userData: user})
        // }

        const phone_otp = Math.floor((Math.random()*1000000)+1);
        user.OTP = phone_otp;
        await client.messages.create(
            {
                body : `Your otp  verification for user ${phone_otp}`,
                messagingServiceSid:'MGf6a269a5834f4decb5b04c35349a09ec',
                to: req.body.mobile_number
            }

        ).then(()=> {

             console.log('Sucessfully otp send to the Mobile Number ');

        }).catch((err) => {

            console.log("otp not send user mobile" , err)
        })

        user.authTokens = newToken
        await user.save()
        user.user_type = undefined;
        user.device_token = undefined;
        user.device_type = undefined;
        user.OTP = undefined;
        user.refresh_tokens = undefined;
        user.authTokens = undefined;
        user.deleted_at = undefined;
        user.status = undefined
        user.profile_img = undefined;
        user.customer_Id = undefined
        user.__v = undefined;
        user._id = undefined;
        return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:USER.login_success , user})

    } catch (err) {
        console.log('Error(Login)', err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}


exports.Otp_Verify = async (req, res, next) => {

    try {

        const  { OTP }  = req.body;
        console.log(OTP)
        const user = req.user;
        console.log(user)
        if(OTP != user.OTP){

            return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:'otp does not match'})
        }
       let newAuthToken = await user.generateAuthToken()
       user.authTokens = newAuthToken;
       user.OTP = "";
       await user.save()
       return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS, message:'otp verify scucessfully'})
      
    } catch (err) {
        console.log(err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}


  
  exports.generate_auth_tokens = async (req, res) => {

    try {

        const refresh_tokens = req.params.refresh_tokens

        let user = await User.findOne({ refresh_tokens: refresh_tokens })

        console.log("user....",user)
        let newToken = await user.generateAuthToken();
        user.authTokens = newToken;
        user.save()
        return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:USER.get_user_auth_token})

    } catch (err) {
        console.log(err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}



exports.get_all_customer = async (req, res) => {

    try {

        let customer = await User.find().limit(10).skip(10)

       customer.forEach(object => {

       object["user_type"] = undefined;
       object["device_token"] = undefined;
       object["device_type"] = undefined;
       object["OTP"] = undefined;
       object["refresh_tokens"] = undefined;
       object["authTokens"] = undefined;
       object["deleted_at"] = undefined;
       object["__v"] = undefined;
       object["_id"] = undefined;
});

        return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:"get all customer list", customer})

    } catch (err) {

        console.log("Error(get_all_customer)" , err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}



exports.update_customer_detalis = async (req, res) => {

    try {

        const reqBody = req.body;
        const { email , customer_name , mobile_number } = reqBody;
    
        const findUser = req.user._id;
    
        if (!findUser)
          return res
            .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
            .send({ status: constants.STATUS_CODE.FAIL,  message: "user not found" });
    
         let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
              new: true,
        });
    
        if (!user)
          return res
            .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
            .send({ status:constants.STATUS_CODE.FAIL , message:"user data not found" });
    
        user.updated_at = await dateFormat.set_current_timestamp()
        return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:"sucessfully update user detalis" , user})

    } catch (err) {
        console.log("Error(update_customer_detalis)" , err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}


exports.customer_account_actived = async (req, res) => {

    try {

        const reqBody = req.body;
        const { status } = reqBody;
    
        const findUser = req.user._id;
    
        if (!findUser)
          return res
            .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
            .send({ status: constants.STATUS_CODE.FAIL,  message: "user not found" });
    
         let user = await User.findOneAndUpdate({ _id: findUser }, req.body, {
              new: true,
        });
    
        if (!user)
          return res
            .status(constants.WEB_STATUS_CODE.BAD_REQUEST)
            .send({ status:constants.STATUS_CODE.FAIL , message:"user data not found" });
    
        user.updated_at = await dateFormat.set_current_timestamp()
        return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:"sucessfully actived customer account" , user})

    } catch (err) {
        console.log("Error(customer_account_actived)" , err)
        return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , message:GENERAL.general_error_content})
    }
}
