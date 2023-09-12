
const {body ,validationResult, param , query} = require('express-validator')
const { constant } = require('lodash')

let fixed_truck_type = ["dalaauto" , "tataace", "small_pickup" , "large_pickup" , "eicher"]

const booking_validator = [

     body('pickup_location')
     .not()
     .isEmpty()
     .withMessage("pickup_loction is required")
     .isString()
     .withMessage("pickup_location should be string")
     .trim() ,

     body('drop_location')
     .not()
     .isEmpty()
     .withMessage("drop_loction is required")
     .isString()
     .withMessage("drop_location should be string")
     .trim(),

     body('truck_type')
     .not()
     .isEmpty()
     .withMessage("truck type is required")
     .isString()
     .withMessage("truck type should be string")
     .isIn(fixed_truck_type)
     .withMessage('Enter vaalid truck type')
     .trim()
]


const booking_otp_verify_validator = [

    body('OTP')
    .not()
    .isEmpty()
    .withMessage('otp is required')
    .isString()
    .withMessage('otp should be a string')
    .isLength({max:6})
    .withMessage('otp length is 6')
    .trim()
]

const List_of_Booking_by_customers_validator = [

  query('userId')
  .not()
  .isEmpty()
  .withMessage('userId is required')
  .isMongoId()
  .withMessage('please Enter valid userId')
]

const List_of_Booking_by_drivers_validator = [

  query('driverId')
  .not()
  .isEmpty()
  .withMessage('driverId is required')
  .isMongoId()
  .withMessage('please Enter valid driverId')
]

const booking_confirm_validator = [

  param('bookingId')
  .not()
  .isEmpty()
  .withMessage('bookingId is required')
  .isMongoId()
  .withMessage('Enter valid BookingId')
  .trim(),

  param('driverId')
  .not()
  .isEmpty()
  .withMessage('driverId is required')
  .isMongoId()
  .withMessage('please Enter valid driverId')
  .trim()

]



const booking_validation_result = (req, res, next) => {

    const result = validationResult(req);
    const haserror = !result.isEmpty();
  
    if (haserror) {
      const err = result.array()[0].msg;
      return res.status(400).send({ sucess: false, message: err });
    }
  
    next();
  };

  
module.exports = {booking_validator, booking_validation_result,booking_confirm_validator , booking_otp_verify_validator , List_of_Booking_by_customers_validator , List_of_Booking_by_drivers_validator}