const { body, validationResult , param , query  } = require("express-validator");
const { USER_VALIDATION } = require("../lang/en/validationMessage");

let nums = [ 1, 2]

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

  body("customer_name")
    .not()
    .isEmpty()
    .withMessage('customer Name is required')
    .isString()
    .withMessage('customer should be string')
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
  .trim(),
];



const refresh_token__validator = [

  param("refresh_tokens")
    .not()
    .isEmpty()
    .withMessage('refresh_tokens is required')
    .isString()
    .withMessage('refresh_tokens should be a string')
    .trim(),
];

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

get_all_customer_validator = [

  body("email")
  .optional()
  .not()
  .isEmpty()
  .withMessage('email or customer_name is required')
  .isString()
  .withMessage('email should be string')
  .isEmail()
  .withMessage('Enter a valid email')
  .trim(),

body("customer_name")
  .optional()
  .not()
  .isEmpty()
  .withMessage('email or customer Name is required')
  .isString()
  .withMessage('customer name should be string')
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
  update_customer_validator,
  validation_result,
  refresh_token__validator,
  update_Roles_validator,
  get_all_customer_validator
};
