const { body } = require('express-validator');

//validate user form detail
exports.create_version_validator = [
  body('version_number')
    .not()
    .isEmpty()
    .withMessage('VERSION_VALIDATION.valid_version_number')
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('VERSION_VALIDATION.format_verion_number')
    .trim(),
  body('device_type')
    .not()
    .isEmpty()
    .withMessage('VERSION_VALIDATION.device_type_required')
    .matches(/^[0-1]/)
    .withMessage('VERSION_VALIDATION.valid_device_type')
    .trim(),
  body('is_force_update')
    .not()
    .isEmpty()
    .withMessage('VERSION_VALIDATION.force_update_value_required')
    .isNumeric()
    .withMessage('VERSION_VALIDATION.valid_force_update_value')
    .matches(/^[0-1]/)
    .withMessage('VERSION_VALIDATION.force_update_value')
    .trim(),
];

//validate user form detail
exports.get_version_validator = [
  body('version_number')
    .not()
    .isEmpty()
    .withMessage('VERSION_VALIDATION.valid_version_number')
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('VERSION_VALIDATION.version_number_formate')
    .trim(),
  body('device_type')
    .not()
    .isEmpty()
    .withMessage('VERSION_VALIDATION.device_type_required')
    .isAlpha()
    .withMessage('VERSION_VALIDATION.valid_device_type')
    .trim()
];