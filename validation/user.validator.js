const { body, validationResult , param , query  } = require("express-validator");
const { USER_VALIDATION } = require("../lang/en/validationMessage");


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
    .isLength({max:12})
    .withMessage("Length should be 10")
    .isMobilePhone()
    .withMessage("Enter Mobile number star with 0 or +91")
    .trim(),
];

const login_validator = [

  
  body("mobile_number")
    .not()
    .isEmpty()
    .withMessage('mobile_numbe is required')
    .isString()
    .withMessage('mobile number should be string')
    .isLength({max:12})
    .withMessage("Length should be 10")
    .isMobilePhone()
    .withMessage("Enter Mobile number star with 0 or +91")
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
  .isLength({max:12})
  .withMessage("Length should be 10")
  .isMobilePhone()
  .withMessage("Enter Mobile number star with 0 or +91")
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

const customerId_validator = [

  query("customerId")
    .not()
    .isEmpty()
    .withMessage('customerId is required')
    .isString()
    .withMessage('customerId should be a string')
    .isMongoId()
    .withMessage('Enter valid customer id')
    .trim(),
];





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
  customerId_validator
};
