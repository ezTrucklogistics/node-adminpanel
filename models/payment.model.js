
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const constants = require("../config/constants");



//Define Booing schema
const PaymentSchema = new Schema({
    
    order_id:{
        type:String
    },
    order_amount:{
        type:Number
    },
    order_currency:{
        type:String
    },
    driver_mobile_number : {
        type:String,
    },
    driver_name : {
        type:String,
    },
    driverId : {
        type:String,
    },
    order_status:{
        type:String,
        default:constants.STATUS.ACCOUNT_ACTIVE
    },
    driver_bank_account_number:{
        type:Number
    },
    ifsc_code : {
        type:String
    },
    payments_url:{type:String},
    refunds_url:{type:String},
    settlements_url: {type:String},
    order_expiry_time:{type:String},
    payment_session_id:{type:String},
    payment_method:{type:Array},
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
  
});


//Define user model
const Payment = mongoose.model('payment', PaymentSchema);
module.exports = Payment;