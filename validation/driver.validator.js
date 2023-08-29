
const { body, validationResult } = require("express-validator");



const driver_validator = [

     body('driver_name')
     .not()
    .isEmpty()
    .withMessage('driver_name is required')
    .isString()
    .withMessage('driver_name must be a string')
    .trim(),

    body('driver_email')
    .not()
    .isEmpty()
    .withMessage('driver_email is required')
    .isString()
    .withMessage('driver_email must be a string')
    .isEmail()
    .withMessage('please enter a valid email')
    .trim(),

    body('driver_mobile_number')
    .not()
    .isEmpty()
    .withMessage('driver_mobile_numbe is required')
    .isString()
    .withMessage('driver_mobile number should be string')
    .isMobilePhone()
    .withMessage("Enter valid Mobile number ")
    .custom((value) => {
      // Custom validation function to check the country code
      if (!value.startsWith('+91')) {
        throw new Error('Mobile number must start with +91');
      }
      return true;
    })
    .trim(),

    body('vehical_number')
    .not()
    .isEmpty()
    .withMessage('vehical_number is required')
    .isString()
    .withMessage('vehical_number must be a string')
    .isLength({min:8})
    .withMessage('vehical_number length mus be  min 8 and max 10')
    .matches(/^[a-zA-Z0-9_.]$/i)
    .withMessage('please enter valid vehical_number')
    .trim(),

    body('brand')
     .not()
    .isEmpty()
    .withMessage('brand is required')
    .isString()
    .withMessage('brand must be a string')
    .trim(),

    body('truck_type')
    .not()
    .isEmpty()
    .withMessage('truck_type is required')
    .isString()
    .withMessage('truck_type must be a string')
    .trim(),

    body('driver_img')
    .not()
    .isEmpty()
    .withMessage('driver_img is required')
    .isString()
    .withMessage('driver_img must be a string')
    .trim(),

    body('account_number')
    .not()
    .isEmpty()
    .withMessage('account_number is required')
    .isString()
    .withMessage('account_number must be a number')
    .isLength({min:11})
    .withMessage('account_number length mus be a number')
    .trim(),

    body('ifsc_code')
    .not()
    .isEmpty()
    .withMessage('ifsc_code is required')
    .isString()
    .isNumeric()
    .withMessage('ifsc_code must be a string and number')
    .isLength({min:11})
    .withMessage('ifsc_code length min is 11')
    .matches(/^[^\s]{4}\d{7}$/)
    .withMessage('please enter a valid ifsc-code')
    .trim(),

    body('Aadhar_card_number')
    .not()
    .isEmpty()
    .withMessage('Aadhar_card_number is required')
    .isString()
    .withMessage('Aadhar_card_number must be a string')
    .isLength({min:12})
    .withMessage('Aadhar_card_number min length is 12')
    .trim(),

    
    body('pan_card_number')
    .not()
    .isEmpty()
    .withMessage('pan_card_number is required')
    .isString()
    .isNumeric()
    .withMessage('pan_card_number must be a string and number')
    .isLength({min:12})
    .withMessage('pan_card_number min length is 12')
    .trim(),

    body('driving_licence')
    .not()
    .isEmpty()
    .withMessage('driving_licence is required')
    .isString()
    .isNumeric()
    .withMessage('driving_licence mus be a string and number')
    .isLength({min:15})
    .withMessage('pan_card_number min length is 15')
    .matches(/^[A-Z]{2}\d{6}$/)
    .withMessage('please enter a valid driving licence')
    .trim(),

]


const login_validator = [

  body('driver_mobile_number')
  .not()
  .isEmpty()
  .withMessage('driver_mobile_numbe is required')
  .isString()
  .withMessage('driver_mobile number should be string')
  .isMobilePhone()
  .withMessage("Enter valid Mobile number ")
  .custom((value) => {
    // Custom validation function to check the country code
    if (!value.startsWith('+91')) {
      throw new Error('Mobile number must start with +91');
    }
    return true;
  })
  .trim(),

  body("token")
    .not()
    .isEmpty()
    .withMessage('token is required')
    .isString()
    .withMessage('token should be string')
    .trim(),

    body("device_type")
    .not()
    .isEmpty()
    .withMessage('device_type is required')
    .isNumeric()
    .withMessage('device_type should be number')
    .trim(),
  
];


const update_current_location_validator = [

     body('driverId')
     .not()
     .notEmpty()
     .withMessage('driverId is required')
     .isString()
     .withMessage('driverId must be a string')
     .isMongoId()
     .withMessage('please enter a valid driverId')
     .trim(),

     body('driver_lat')
     .not()
     .isEmpty()
     .withMessage('driver_lat is required')
     .isNumeric()
     .withMessage('driver_lat mus be a number')
     .trim() ,

     body('driver_long')
     .not()
     .isEmpty()
     .withMessage('driver_long is required')
     .isNumeric()
     .withMessage('driver_long mus be a number')
     .trim()
]


const validation_result = (req, res, next) => {
    const result = validationResult(req);
    const haserror = !result.isEmpty();
  
    if (haserror) {
      const err = result.array()[0].msg;
      return res.status(400).send({ sucess: false, message: err });
    }
  
    next();
  };


module.exports = {
    driver_validator,
    validation_result,login_validator,
    update_current_location_validator
}