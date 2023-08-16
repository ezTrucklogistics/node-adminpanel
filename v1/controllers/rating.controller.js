
const dateFormat = require("../../helper/dateformat.helper");
const constants = require("../../config/constants");
const Rating = require("../../models/rating.model");
const driver = require('../../models/driver.model');



exports.create_rating = async (req, res) => {

  try {

    let reqBody = req.body;
    const user = req.user._id;
    const { driverId, customerId, rating_number , desc } = reqBody;

    if (!user) {
        return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:'CUSTOMER NOT FOUND'});
      }

    const drivers = await driver.findById(driverId);

    if (!drivers) {
      return res.status(constants.WEB_STATUS_CODE.BAD_REQUEST).send({status:constants.STATUS_CODE.FAIL , message:'DRIVER NOT FOUND'});
    }
    
    reqBody.customerId = user
    reqBody.created_at = dateFormat.set_current_timestamp()
    let rating = await Rating.create(reqBody)

    return res.status(constants.WEB_STATUS_CODE.CREATED).send({status:constants.STATUS_CODE.SUCCESS , message:"RATING SUMBIT SUCESSFULLY" , rating})
   
  } catch (err) {

    console.log("Error(create_rating)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , msg:"Something went wrong. Please try again later."})
  }

};


exports.total_rating = async (req, res) => {

    try {

      const data = await Rating.find().populate('driverId' , 'driver_name').populate('customerId' , 'customer_name')

      return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:"RATING SUCESSFULLY RETURN" , data})
     
    } catch (err) {
  
      console.log("Error(create_rating)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , msg:"Something went wrong. Please try again later."})
    }
  
  };
  

  exports.all_total_rating = async (req, res) => {

    try {
  
      const total_rating = await Rating.countDocuments();

      return res.status(constants.WEB_STATUS_CODE.OK).send({status:constants.STATUS_CODE.SUCCESS , message:"SUCESSFULLY RETURN ALL RATINGS" , total_rating})
     
    } catch (err) {
  
      console.log("Error(create_rating)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({status:constants.STATUS_CODE.FAIL , msg:"Something went wrong. Please try again later."})
    }
  
  };
  
