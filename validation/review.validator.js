const { body,param, query  } = require("express-validator");



exports.review_validator = [

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

exports.get_review = [

  param("driverId")
  .not()
  .isEmpty()
  .withMessage('driverId is required')
  .isString()
  .withMessage('driverId should be string')
  .isMongoId()
  .withMessage('please enter a driverId')
  .trim(),
]
