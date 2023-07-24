
const { body, validationResult } = require("express-validator");
const {DRIVER_VALIDATION} = require("../lang/en/validationMessage");



const driver_validator = [

     body('driver_name')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.driver_name)
    .isString()
    .withMessage(DRIVER_VALIDATION.driver_name_is_string)
    .trim(),

    body('driver_email')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.driver_email)
    .isString()
    .withMessage(DRIVER_VALIDATION.driver_email_is_string)
    .isEmail()
    .withMessage(DRIVER_VALIDATION.valid_email)
    .trim(),

    body('driver_mobile_number')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.driver_mobile_number)
    .isString()
    .withMessage(DRIVER_VALIDATION.driver_mobile_number_is_string)
    .isLength({min:10})
    .withMessage(DRIVER_VALIDATION.mobile_number_length)
    .trim(),

    body('vehical_number')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.vehical_number_required)
    .isString()
    .withMessage(DRIVER_VALIDATION.vehical_number_is_string)
    .isLength({min:8})
    .withMessage(DRIVER_VALIDATION.vehical_number_length)
    .matches(/^[a-zA-Z0-9_.]$/i)
    .withMessage(DRIVER_VALIDATION.valid_vehical_number)
    .trim(),

    body('brand')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.brand_required)
    .isString()
    .withMessage(DRIVER_VALIDATION.brand_number_is_string)
    .trim(),

    body('truck_type')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.truck_type_required)
    .isString()
    .withMessage(DRIVER_VALIDATION.truck_type_is_string)
    .trim(),

    body('account_number')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.truck_type_required)
    .isString()
    .withMessage(DRIVER_VALIDATION.truck_type_is_string)
    .isLength({min:11})
    .withMessage(DRIVER_VALIDATION.account_number_length)
    .trim(),

    body('ifsc_code')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.ifsc_code_required)
    .isString()
    .withMessage(DRIVER_VALIDATION.ifsc_code_is_string)
    .isLength({min:11})
    .withMessage(DRIVER_VALIDATION.ifsc_code_length)
    .isUppercase()
    .withMessage(DRIVER_VALIDATION.ifsc_code_capital)
    .trim(),

    body('Aadhar_card_number')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.Aadhar_card_numberrequired)
    .isString()
    .withMessage(DRIVER_VALIDATION.Aadhar_card_number_is_number)
    .isLength({min:12})
    .withMessage(DRIVER_VALIDATION.Aadhar_card_number_length)
    .trim(),

    
    body('pan_card_number')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.pan_card_numberr_equired)
    .isString()
    .withMessage(DRIVER_VALIDATION.pan_card_number_is_number)
    .isLength({min:10})
    .withMessage(DRIVER_VALIDATION.pan_card_number_length)
    .trim(),

    body('driving_licence')
    .isEmpty()
    .withMessage(DRIVER_VALIDATION.driving_licence_equired)
    .isString()
    .withMessage(DRIVER_VALIDATION.driving_licence_is_string)
    .isLength({min:15})
    .isUppercase()
    .withMessage('letter should be uppercase')
    .withMessage(DRIVER_VALIDATION.driving_licence_length)
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
    driver_validator,
    validation_result
}