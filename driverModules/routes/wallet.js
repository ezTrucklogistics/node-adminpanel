const express = require("express");
const { create_wallet, get_wallet } = require("../controller/wallet.controller");
const router = express.Router();
const {driver_authenticate} = require("../../middleware/authenticate")


router.post("/createWallet" , driver_authenticate , create_wallet);
router.get('/getWallets' , get_wallet)



module.exports = router;
