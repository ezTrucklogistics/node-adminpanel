const express = require("express");
const { get_earning } = require("../controller/wallet.controller");
const router = express.Router();


router.get('/daily_earnings_and_Monthly' , get_earning);




module.exports = router;
