
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
        type: String 
    },
    truck_type: {
        type: String,
        lowercase:true
    },
    booking_status:{
        type:String,
        default: constants.BOOKING_STATUS.STATUS_PENDING
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