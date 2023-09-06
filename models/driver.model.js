
const mongoose = require('mongoose');
const constants = require("../config/constants")
const {JWT_SECRET} = require("../keys/development.keys")
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken")
const dateFormat = require("../helper/dateformat.helper")



//Define Booing schema
const driverSchema = new Schema({

    driver_mobile_number: {
        type: String, 
    },
    driver_img :{
        type:String,
    },
    driver_current_location:{
        type:String,
    },
    driver_lat:{
        type:Number,
    },
    driver_long:{
        type:Number,
    },
    driver_name: {
        type: String,
    },
    driver_email: {
        type:String,
    },
    driver_img: {
        type:String,
    },
    user_type: {
        type: Number, //1-admin 2-user
        default: 1
     },
    vehical_number: {
        type: String,
    }, 
    brand: {
        type: String,
    },
    truck_type: {
        type: String,
    },
    status:{
        type:String,
        default:constants.STATUS.ACCOUNT_DEACTIVE
    },
    earning:[{
        type:Number,
        default:0
    }],
    driver_status:{
        type:String,
        default:constants.DRIVER_STATUS.STATUS_2
    },
    account_number: {
        type: Number,
    },
    ifsc_code:{
        type:String,
    },
    Aadhar_card_number:{
        type:Number,
    },
    pan_card_number: {
        type: String,
        uppercase:true
    },
    driving_licence:{
        type:String,
    },
    device_token: {
        type: String,
        default: null
    },
    device_type: {
        type: Number,
        default: null  // 'ANDROID' : 1,	'IOS' : 2,
    },
    total_reviews: { 
        type:Number,
        default:0
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'review' }],
    refresh_tokens: {
        type: String,
        default:null
    },
    authTokens: {
        type: String,
        default:null
    },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
    deleted_at: {
      type: String,
      default: null,
    },
});


driverSchema.index({
    "driver_mobile_number": 1
});

//Output data to JSON
driverSchema.methods.toJSON = function () {
    const driver = this;
    const userObject = driver.toObject();
    return userObject;
};

//Generating auth token
driverSchema.methods.generateAuthToken = async function () {
    const driver = this;
    const token = await jwt.sign({
        _id: driver._id.toString()
    }, JWT_SECRET , { expiresIn: '24h' })
    driver.tokens = token
    driver.updated_at = await dateFormat.set_current_timestamp();
    driver.refresh_tokens_expires = await dateFormat.add_time_current_date(1,'days')
    await driver.save()
    return token
}

driverSchema.methods.generateRefreshToken = async function () {
    const driver = this;
    const refresh_tokens = await jwt.sign({
        _id: driver._id.toString()
    }, JWT_SECRET)

    driver.refresh_tokens = refresh_tokens
    driver.updated_at = await dateFormat.set_current_timestamp();
    await driver.save()
    return refresh_tokens
}


//Define user model
const driver = mongoose.model('driver', driverSchema);
module.exports = driver;