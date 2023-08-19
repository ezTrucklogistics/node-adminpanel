
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


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