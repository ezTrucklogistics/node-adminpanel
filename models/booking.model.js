
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
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'driver',
        default:null
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
    payment_type:{
        type:String,
        default:""
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
const booking = mongoose.model('booking', bookingSchema);
module.exports = booking;