const  constants = require('../config/constants');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;



//Define Booing schema
const bookingSchema = new Schema({
    
    pickup_location: {
        type: String,
    }, 
    drop_location :{
        type:String,
    },
    pickup_location_lat: {
        type: Number,
    },
    pickup_location_long : {
        type:Number,
    },
    drop_location_lat: {
        type: Number, 
    },
    drop_location_long: {
        type: Number, 
    },
    trip_cost: {
        type: Number,
    },
    duration: {
        type: String,
    },
    distance:{
        type:String,
    },
    User: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users',
        default:null
    },
    driver: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'driver',
        default:null
    },
    driver_share: {
        type: Number,
        default: 0
    },
    company_share:{
      type:Number,
      default:0
    },
    truck_type: {
        type: String,
        lowercase:true,
        enum:["dalaauto" , "tataace", "small_pickup" , "large_pickup" , "eicher"]
    },
    booking_status:{
        type:String,
        default: constants.BOOKING_STATUS.STATUS_PENDING
    },
    booking_cancel_reason_for_customer:{
        type:String,
        default:""
    },
    booking_cancel_reason_for_driver:{
        type:String,
        default:""
    },
    total_company_share:{
        type:Number,
        default:0
    },
    total_earning_by_driver:{
        type:Number,
        default:0
    },
    payment_type:{
        type:String,
        default:""
    },
    OTP:{
        type:String,
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
    total_discount: {
        type: Number,
        default: 0, 
    },
});

//Output data to JSON
bookingSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    return userObject;
};

//Define user model
const booking = mongoose.model('booking', bookingSchema);
module.exports = booking;