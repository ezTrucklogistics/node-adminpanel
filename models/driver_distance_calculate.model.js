
const mongoose = require('mongoose');
const constants = require("../config/constants")
const {JWT_SECRET} = require("../keys/development.keys")
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken")
const dateFormat = require("../helper/dateformat.helper")


//Define Booing schema
const distanceSchema = new Schema({
    
    driver_current_location:{
        type:String,
    },
    customer_current_location:{
       type:String
    },
    distance:{
        type:String,
    },
    duration:{
        type:String,
    }
  
});

const distances = mongoose.model('distance_by_customer_driver' , distanceSchema);
module.exports = distances;