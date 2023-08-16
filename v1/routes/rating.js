const express = require("express");
const router = express.Router();
const { authenticate } = require('../../middleware/authenticate');
const { create_rating, total_rating, all_total_rating } = require("../controllers/rating.controller");


router.post('/create_rating' , authenticate , create_rating );
router.get('/get_all_ratings' ,  total_rating)
router.get('/total_ratings' , all_total_rating)



module.exports = router;
