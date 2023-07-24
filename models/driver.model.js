
const mongoose = require('mongoose');
const constants = require("../config/constants")

const Schema = mongoose.Schema;

  

//Define Booing schema
const driverSchema = new Schema({
    
    driverId: {
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
    driver_mobile_number: {
        type: String, 
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
        default:constants.STATUS.ACCOUNT_DEACCTIVE
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
    driver_total_earning:{
        type:String
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


//Define user model
const driver = mongoose.model('driver', driverSchema);
module.exports = driver;