const { body, param, query} = require("express-validator");



//validate user form detail
exports.contact_validator = [

  body("street")
    .not()
    .isEmpty()
    .withMessage('street is required')
    .isString()
    .withMessage('street should be string')
    .trim(),
   
    body("city")
    .not()
    .isEmpty()
    .withMessage('city is required')
    .isString()
    .withMessage('city should be string')
    .trim(),

    body("state")
    .not()
    .isEmpty()
    .withMessage('state is required')
    .isString()
    .withMessage('state should be string')
    .trim(),

    body("country")
    .not()
    .isEmpty()
    .withMessage('country is required')
    .isString()
    .withMessage('country should be string')
    .trim(),

    body("pinCode")
    .not()
    .isEmpty()
    .withMessage('pinCode is required')
    .isString()
    .withMessage('pinCode should be string')
    .trim(),
];

exports.get_contacts_validator = [

  param('contactId')
  .not()
  .isEmpty()
  .withMessage('contactId is required')
  .isString()
  .withMessage('contactId should be string')
  .isMongoId()
  .withMessage('Enter a valid contactId')
  .trim(),
]

exports.update_contact_validator = [

     query('contactId')
     .not()
     .isEmpty()
     .withMessage('contactId is required')
     .isString()
     .withMessage('contactId should be string')
     .isMongoId()
     .withMessage('Enter a valid contactId')
     .trim(),
]

