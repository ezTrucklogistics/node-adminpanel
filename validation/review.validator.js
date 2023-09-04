const { body,param, query  } = require("express-validator");



exports.contact_validator = [

  body("rating")
    .not()
    .isEmpty()
    .withMessage('rating is required')
    .isNumeric()
    .withMessage('rating should be number')
    .isLength({max:5})
    .trim(),

    body("comment")
    .not()
    .isEmpty()
    .withMessage('comment is required')
    .isString()
    .withMessage('comment should be string')
    .trim(),

];
