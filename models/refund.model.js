const mongoose = require("mongoose")


const refundSchema = new mongoose.Schema({

    cf_payment_id : {type:Number},
    cf_refund_id: {type:String},
    refund_id: {type:String},
    order_id:{type:String},
    entity: {type:String},
    refund_amount: {type:Number},
    refund_currency:{type:String},
    refund_note:{type:String},
    refund_status: {type:String},
    refund_type: {type:String},
    refund_splits: {type:String},
    status_description: {type:String},
    refund_arn: {type:String},
    metadata:{type:String , default:null},
    created_at: {type:String},
    processed_at:{type:String},
    refund_charge:{type:Number},
    refund_mode: {type:String},

});



const refund = mongoose.model('refund', refundSchema);
module.exports = refund ;