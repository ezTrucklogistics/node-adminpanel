const express = require("express");
const { create_payment_order, GetOrder, Payment_preauthorization } = require("../controller/payment.controller");
const router = express.Router();

router.post("/createOrder" , create_payment_order)
router.get("/GetOrder" , GetOrder)
router.post("/preauthorization" , Payment_preauthorization)

module.exports = router

