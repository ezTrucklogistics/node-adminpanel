const { body, validationResult , param  } = require("express-validator");
const { USER_VALIDATION } = require("../lang/en/validationMessage");


//validate user form detail
const user_validator = [

  body("email")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.email_required)
    .isString()
    .withMessage(USER_VALIDATION.email_is_string)
    .isEmail()
    .withMessage(USER_VALIDATION.valid_email)
    .trim(),

  body("customer_name")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.name_required)
    .isString()
    .withMessage(USER_VALIDATION.name_is_string)
    .trim(),

  body("mobile_number")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.mobile_number_is_required)
    .isString()
    .withMessage(USER_VALIDATION.mobile_is_string)
    .isLength({min:10})
    .withMessage("Length should be 10")
    .isMobilePhone()
    .withMessage("Enter Valid Mobile number")
    .matches(/((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/)
    .withMessage("Enter Valid Mobile number")
    .trim(),
];

const login_validator = [

  body("mobile_number")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.mobile_number_is_required)
    .isString()
    .withMessage(USER_VALIDATION.mobile_is_string)
    .isLength({min:10})
    .withMessage("Length should be 10")
    .isMobilePhone()
    .withMessage("Enter Valid Mobile number")
    .matches(/((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/)
    .withMessage("Enter Valid Mobile number")
    .trim(),
];

const update_customer_validator = [

  body("mobile_number")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.mobile_number_is_required)
    .isString()
    .withMessage(USER_VALIDATION.mobile_is_string)
    .isLength({ min: 10 })
    .withMessage(USER_VALIDATION.mobile_number_length)
    .isMobilePhone()
    .withMessage("Enter Valid Mobile number")
    .trim(),

  body("email")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.email_required)
    .isString()
    .withMessage(USER_VALIDATION.email_is_string)
    .isEmail()
    .withMessage(USER_VALIDATION.valid_email)
    .trim(),

  body("customer_name")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.name_required)
    .isString()
    .withMessage(USER_VALIDATION.name_is_string)
    .trim(),
];

const update_customer_status_validator = [

  body("status")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.status_required)
    .isString()
    .withMessage(USER_VALIDATION.status_is_string)
    .trim(),
];



const refresh_token__validator = [

  param("refresh_tokens")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.refresh_token_required)
    .isString()
    .isMongoId()
    .withMessage('please enter valid token')
    .withMessage(USER_VALIDATION.refresh_token_is_string)
    .matches(/^[a-f0-9]+$/)
    .withMessage(USER_VALIDATION.refresh_token_invalid)
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
  update_customer_status_validator,
  update_customer_validator,
  validation_result,
  refresh_token__validator
};
