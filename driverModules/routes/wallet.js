const express = require("express");
const { create_wallet, get_wallet, get_earning_in_daily } = require("../controller/wallet.controller");
const router = express.Router();
const {driver_authenticate} = require("../../middleware/authenticate")


router.post("/createWallet" , driver_authenticate , create_wallet);
router.get('/getWallets' , get_wallet)
router.get('/daily_earnings_and_Monthly' , get_earning_in_daily);




module.exports = router;
