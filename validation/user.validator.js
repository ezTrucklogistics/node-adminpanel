

const { body, validationResult } = require('express-validator');
const { USER_VALIDATION } = require("../lang/en/validationMessage")



//validate user form detail
exports.user_validator = [

    body('email')
      .not()
      .isEmpty()
      .withMessage(USER_VALIDATION.email_required)
      .isString()
      .withMessage(USER_VALIDATION.email_is_string)
      .isEmail().withMessage(USER_VALIDATION.valid_email)
      .trim(),

      body('name')
      .not()
      .isEmpty()
      .withMessage(USER_VALIDATION.name_required)
      .isString()
      .withMessage(USER_VALIDATION.name_is_string)
      .trim(),

      body('mobile_number')
      .not()
      .isEmpty()
      .withMessage(USER_VALIDATION.mobile_number_is_required)
      .isString()
      .withMessage(USER_VALIDATION.mobile_is_string)
      .isMobilePhone()
      .withMessage('Enter Valid Mobile number')
      .trim()
];


exports.login_validator = [

  body('mobile_number')
  .not()
  .isEmpty()
  .withMessage(USER_VALIDATION.mobile_number_is_required)
  .isString()
  .withMessage(USER_VALIDATION.mobile_is_string)
  .isLength({max:10})
  .withMessage(USER_VALIDATION.mobile_number_length)
  .isMobilePhone()
  .withMessage('Enter Valid Mobile number')
  .trim()

];

exports.update_customer_validator = [

  body('mobile_number')
  .not()
  .isEmpty()
  .withMessage(USER_VALIDATION.mobile_number_is_required)
  .isString()
  .withMessage(USER_VALIDATION.mobile_is_string)
  .isLength({max:10})
  .withMessage(USER_VALIDATION.mobile_number_length)
  .isMobilePhone()
  .withMessage('Enter Valid Mobile number')
  .trim(),

  body('email')
  .not()
  .isEmpty()
  .withMessage(USER_VALIDATION.email_required)
  .isString()
  .withMessage(USER_VALIDATION.email_is_string)
  .isEmail().withMessage(USER_VALIDATION.valid_email)
  .trim(),

  body('customer_name')
  .not()
  .isEmpty()
  .withMessage(USER_VALIDATION.name_required)
  .isString()
  .withMessage(USER_VALIDATION.name_is_string)
  .trim(),
]



const validation_result = (req,res,next) => {

  const result = validationResult(req);
  const haserror = !result.isEmpty();

  if(haserror){

     const err = result.array()[0].msg;
    return res.status(400).send({sucess:false , message:err});
  }

  next();
};


module.exports = {validation_result}