const express = require("express");
const {
  create_payment_order,
  GetOrder,
  Payment_preauthorization,
  create_payment_refund,
  GetAllRefund,
  GetRefund,
  Get_Settlements_by_Order_ID,
} = require("../controller/payment.controller");
const router = express.Router();


router.post("/createOrder", create_payment_order);
router.get("/GetOrder", GetOrder);
router.post("/preauthorization", Payment_preauthorization);
router.post("/create_payment_refund", create_payment_refund);
router.get("/get_all_refund_amount", GetAllRefund);
router.get("/get_refund_amount", GetRefund);
router.get("Get_Settlements_by_Order_ID" , Get_Settlements_by_Order_ID)




module.exports = router;
