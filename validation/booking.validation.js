
const {body ,validationResult, param} = require('express-validator')

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
     .withMessage("pickup_loction is required")
     .isString()
     .withMessage("pickup_location should be string")
     .isIn(fixed_truck_type)
     .trim()
]

const get_booking_by_id = [

  param('bookingId')
  .not()
  .isEmpty()
  .withMessage('bookingId is required')
  .isMongoId()
  .withMessage('Enter valid BookingId')
]


const update_booking_cancel_by_customer = [

  body('booking_cancel_reason_for_customer')
  .not()
  .isEmpty()
  .withMessage("booking_cancel_reason_for_customer is required")
  .isString()
  .withMessage("booking_cancel_reason_for_customer should be string")
  .trim() ,

  param('bookingId')
  .not()
  .isEmpty()
  .withMessage('bookingId is required')
  .isMongoId()
  .withMessage('Enter valid BookingId')

]

const update_booking_cancel_by_driver = [

  body('booking_cancel_reason_for_customer')
  .not()
  .isEmpty()
  .withMessage("update_booking_cancel_by_driver is required")
  .isString()
  .withMessage("update_booking_cancel_by_driver should be string")
  .trim() ,

  param('bookingId')
  .not()
  .isEmpty()
  .withMessage('bookingId is required')
  .isMongoId()
  .withMessage('Enter valid BookingId')

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

  
module.exports = {booking_validator, booking_validation_result ,  update_booking_cancel_by_customer, update_booking_cancel_by_driver , get_booking_by_id}