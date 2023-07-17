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
    .isMobilePhone()
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
    .isLength({ max: 10 })
    .withMessage(USER_VALIDATION.mobile_number_length)
    .isMobilePhone()
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
    .isLength({ max: 10 })
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

const Verify_otp_validator = [

  body("OTP")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.otp_required)
    .isString()
    .withMessage(USER_VALIDATION.otp_is_number)
    .isLength({max:6})
    .withMessage(USER_VALIDATION.otp_length)
    .trim(),
];

const refresh_token__validator = [

  param("refresh_tokens")
    .not()
    .isEmpty()
    .withMessage(USER_VALIDATION.refresh_token_required)
    .isString()
    .withMessage(USER_VALIDATION.refresh_token_is_string)
    .isLength({max:24})
    .withMessage(USER_VALIDATION.refresh_token_length)
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
  Verify_otp_validator,
  refresh_token__validator
};
