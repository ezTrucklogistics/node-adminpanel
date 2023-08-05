const Payment = require("../../models/payment.model");
const { sendResponse } = require("../../services/common.service");
const constants = require("../../config/constants");
const sdk = require("api")("@cashfreedocs-new/v3#z7c5zzlkqza7c0");
const dateFormate = require("../../helper/dateformat.helper")



exports.create_payment_order = async (req, res) => {

  try {

    let reqBody = req.body;
    sdk.server('https://api.cashfree.com/pg');
    const data = await sdk.createOrder(
      {

        created_at : reqBody.created_at = dateFormate.set_current_timestamp(),
        customer_details: {
          customer_id: reqBody.driverId,
          customer_email: reqBody.drive_email,
          customer_phone: reqBody.drive_phone,
          customer_name:reqBody.driver_name,
        },
        order_amount: reqBody.order_amount,
        order_currency: "INR",
        order_id:reqBody.order_id
      },
      {
        "x-client-id": "131642e290fab66ebbe5b52d62246131",
        "x-client-secret": "0f18e731a53e6a6ea065af4bf44419b6f2eadda6",
        "x-api-version": "2022-09-01",
      }
    );


    // Save the payment data to MongoDB
    const paymentData = new Payment({
    
      created_at:data.data.created_at,
      driverId: data.data.customer_details.customer_id,
      driver_name: data.data.customer_details.customer_name,
      driver_email: data.data.customer_details.customer_email,
      driver_phone: data.data.customer_details.customer_phone,
      order_amount:data.data.order_amount,
      order_currency:data.data.order_currency,
      order_expiry_time:data.data.order_expiry_time,
      order_id:data.data.order_id,
      payments_url: data.data.payments.url,
      refunds_url: data.data.refunds.url,
      settlements_url: data.data.settlements.url,
      driver_bank_account_number:reqBody.driver_bank_account_number,
      ifsc_code:reqBody.ifsc_code,
      payment_session_id:data.data.payment_session_id
      
    });

    await paymentData.save();
  

    return res
      .status(constants.WEB_STATUS_CODE.CREATED)
      .send({
        status: constants.STATUS_CODE.SUCCESS,
        msg: "PAYMENT ORDER CREATED SUCCESSFULLY",
       paymentData
      });

  } catch (err) {
    console.error("Error(create_payment_order)", err);
    return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
      status: constants.STATUS_CODE.ERROR,
      msg: "Something went wrong while creating the payment order.",
      
    });
  }
};



exports.GetOrder = async (req, res) => {

    try {

      let { order_id } = req.query
     sdk.server('https://api.cashfree.com/pg');
      const data = await sdk.GetOrder({
        order_id: order_id,
        "x-client-id": "131642e290fab66ebbe5b52d62246131",
        "x-client-secret": "0f18e731a53e6a6ea065af4bf44419b6f2eadda6",
        "x-api-version": "2022-09-01",
      })
  
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "GET ORDER SUCCESSFULLY",
          data
        });
  
    } catch (err) {
      console.error("Error(GetOrder)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  };


  exports.Payment_preauthorization = async (req, res) => {

    try {

      let { order_id } = req.query
  
       sdk.server('https://api.cashfree.com/pg');

      const data = await sdk.preauthorization({
        order_id: order_id,
        "x-client-id": "131642e290fab66ebbe5b52d62246131",
        "x-client-secret": "0f18e731a53e6a6ea065af4bf44419b6f2eadda6",
        "x-api-version": "2022-09-01",
      })
  
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "SUCCESSFULLY AUTHORIZISED PAYMENT",
          data
        });
  
    } catch (err) {
      console.error("Error(Payment_preauthorization)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  };

  exports.OrderPay = async (req, res) => {

    try {

      let { order_id } = req.query
  
       sdk.server('https://api.cashfree.com/pg');
       
      const data = await sdk.preauthorization({
        order_id: order_id,
        "x-client-id": "131642e290fab66ebbe5b52d62246131",
        "x-client-secret": "0f18e731a53e6a6ea065af4bf44419b6f2eadda6",
        "x-api-version": "2022-09-01",
      })
  
      await Payment.findOneAndUpdate({order_id} , {$set:{payment_method:data}})
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "SUCCESSFULLY AUTHORIZISED PAYMENT",
          data
        });
  
    } catch (err) {
      console.error("Error(OrderPay)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  };