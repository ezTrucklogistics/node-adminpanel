const { body, validationResult , param , query  } = require("express-validator");



//validate user form detail
const user_validator = [

  body("email")
    .not()
    .isEmpty()
    .withMessage('email is required')
    .isString()
    .withMessage('email should be string')
    .isEmail()
    .withMessage('Enter a valid emai')
    .trim(),

    body("termConditions")
    .not()
    .isEmpty()
    .withMessage('termConditions is required')
    .isBoolean()
    .withMessage('termConditions should be booleans')
    .trim(),

  body("customer_name")
    .not()
    .isEmpty()
    .withMessage('customer Name is required')
    .isString()
    .withMessage('customer Name should be string')
    .trim(),

  body("mobile_number")
    .not()
    .isEmpty()
    .withMessage('mobile_numbe is required')
    .isString()
    .withMessage('mobile number should be string')
    .isMobilePhone()
    .withMessage("Enter valid Mobile number")
    .custom((value) => {
      // Custom validation function to check the country code
      if (!value.startsWith('+91')) {
        throw new Error('Mobile number must start with +91');
      }
      return true;
    })
    .isLength({min:13})
    .withMessage('please number length should be 12')
    .trim(),

];

const login_validator = [

  
  body("mobile_number")
    .not()
    .isEmpty()
    .withMessage('mobile_numbe is required')
    .isString()
    .withMessage('mobile number should be string')
    .isMobilePhone()
    .withMessage("Enter valid Mobile number ")
    .custom((value) => {
      // Custom validation function to check the country code
      if (!value.startsWith('+91')) {
        throw new Error('Mobile number must start with +91');
      }
      return true;
    })
    .isLength({min:13})
    .withMessage('please number length should be 12')
    .trim(),

];

const update_customer_validator = [

  body("email")
  .not()
  .isEmpty()
  .withMessage('email is required')
  .isString()
  .withMessage('email should be string')
  .isEmail()
  .withMessage('Enter a valid email')
  .trim(),

body("customer_name")
  .not()
  .isEmpty()
  .withMessage('customer Name is required')
  .isString()
  .withMessage('customer should be string')
  .trim(),
]



const  update_Roles_validator = [

    query('email')
    .not()
    .isEmpty()
    .withMessage('email is required')
    .isString()
    .withMessage('email should be a string')
    .isEmail()
    .withMessage('Enter valid email')
    .trim(),
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
  user_validator,
  login_validator,
  update_customer_validator,
  validation_result,
  update_Roles_validator,
  account_verify_validator
};
