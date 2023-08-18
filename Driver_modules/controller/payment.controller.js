const Payment = require("../../models/payment.model");
const constants = require("../../config/constants");
const sdk = require("api")("@cashfreedocs-new/v3#z7c5zzlkqza7c0");
const dateFormate = require("../../helper/dateformat.helper")
const refund  = require("../../models/refund.model")



exports.create_payment_order = async (req, res) => {

  try {

    let reqBody = req.body;
    sdk.server('https://sandbox.cashfree.com/pg/orders');
    const data = await sdk.createOrder(
      {

        created_at : reqBody.created_at = dateFormate.set_current_timestamp(),
        customer_details: {
          customer_id: reqBody.paymentId,
          customer_email: reqBody.email,
          customer_phone: reqBody.mobile_number,
          customer_name:reqBody.name,
        },
        order_amount: reqBody.order_amount,
        order_currency: "INR",
        order_id:reqBody.order_id
      },
      {
        'x-client-id': '847673e995aa46bb6de60ae4276748',
        'x-client-secret': 'e760149f048327c3588778e26e56b2d779e2fb51',
        'x-api-version': '2022-09-01'
      }
    );


    // Save the payment data to MongoDB
    const paymentData = new Payment({
    
      created_at:data.data.created_at,
      paymentId: data.data.customer_details.customer_id,
      name: data.data.customer_details.customer_name,
      email: data.data.customer_details.customer_email,
      mobile_number: data.data.customer_details.customer_phone,
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
     sdk.server('https://sandbox.cashfree.com/pg/orders/{order_id}');
      const data = await sdk.GetOrder({
        order_id: order_id,
        'x-client-id': '847673e995aa46bb6de60ae4276748',
        'x-client-secret': 'e760149f048327c3588778e26e56b2d779e2fb51',
        'x-api-version': '2022-09-01'
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

      let { payment_session_id } = req.query
       sdk.server('https://sandbox.cashfree.com/pg/orders/sessions');
      const data = await sdk.OrderPay({
        payment_session_id : payment_session_id,
        "x-client-id": "131642e290fab66ebbe5b52d62246131",
        "x-client-secret": "0f18e731a53e6a6ea065af4bf44419b6f2eadda6",
        "x-api-version": "2022-09-01",
      })
      console.log(data)

      await Payment.findOneAndUpdate({ payment_session_id } , {$set:{ $push: { payment_method : data } }}, {new:true})
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "SUCCESSFULLY ORDER",
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


  //........................ Refund all Api......................................

  exports.create_payment_refund = async (req, res) => {

    try {
  
      let {order_id , refund_amount } = req.query;

      sdk.server('https://sandbox.cashfree.com/pg');

      const data = await sdk.createrefund(
        {
  
          refund_amount: refund_amount
        }, {
          order_id: order_id,
          'x-client-id': '847673e995aa46bb6de60ae4276748',
          'x-client-secret': 'e760149f048327c3588778e26e56b2d779e2fb51',
          'x-api-version': '2022-09-01'
        
        },
      );
  
  
      // // Save the payment data to MongoDB
      // const paymentData = new Payment({
      
      //   created_at:data.data.created_at,
      //   driverId: data.data.customer_details.customer_id,
      //   driver_name: data.data.customer_details.customer_name,
      //   driver_email: data.data.customer_details.customer_email,
      //   driver_phone: data.data.customer_details.customer_phone,
      //   order_amount:data.data.order_amount,
      //   order_currency:data.data.order_currency,
      //   order_expiry_time:data.data.order_expiry_time,
      //   order_id:data.data.order_id,
      //   payments_url: data.data.payments.url,
      //   refunds_url: data.data.refunds.url,
      //   settlements_url: data.data.settlements.url,
      //   driver_bank_account_number:reqBody.driver_bank_account_number,
      //   ifsc_code:reqBody.ifsc_code,
      //   payment_session_id:data.data.payment_session_id
        
      // });
  
      // await paymentData.save();
    
  
      return res
        .status(constants.WEB_STATUS_CODE.CREATED)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "PAYMENT REFUND CREATED SUCCESSFULLY",
          data
        });
  
    } catch (err) {
      console.error("Error( create_payment_refund )", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  };


  exports.GetAllRefund = async (req, res) => {

    try {

      let { order_id } = req.query
  
      // sdk.server('https://api.cashfree.com/pg');
       
      const data = await sdk.getallrefundsfororde({
        order_id: order_id,
          'x-client-id': '847673e995aa46bb6de60ae4276748',
          'x-client-secret': 'e760149f048327c3588778e26e56b2d779e2fb51',
          'x-api-version': '2022-09-01'
      })
  
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "SUCCESSFULLY GET ALL REFUND AMOUNT",
          data
        });
  
    } catch (err) {
      console.error("Error(GetAllRefund)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  }; 


  exports.GetRefund = async (req, res) => {

    try {

      let { order_id } = req.query
  
      // sdk.server('https://api.cashfree.com/pg');
       
      const data = await sdk.getRefund({
        order_id: order_id,
          'x-client-id': '847673e995aa46bb6de60ae4276748',
          'x-client-secret': 'e760149f048327c3588778e26e56b2d779e2fb51',
          'x-api-version': '2022-09-01'
      })
  
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "SUCCESSFULLY GET REFUND AMOUNT",
          data
        });
  
    } catch (err) {

      console.error("Error(GetRefund)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  }; 


   //........................Settlements all Api......................................

   exports.Get_Settlements_by_Order_ID = async (req, res) => {

    try {

      let { order_id } = req.query
  
      // sdk.server('https://api.cashfree.com/pg');
       
      const data = await sdk.getRefund({
        order_id: order_id,
          'x-client-id': '847673e995aa46bb6de60ae4276748',
          'x-client-secret': 'e760149f048327c3588778e26e56b2d779e2fb51',
          'x-api-version': '2022-09-01'
      })
  
      return res
        .status(constants.WEB_STATUS_CODE.OK)
        .send({
          status: constants.STATUS_CODE.SUCCESS,
          msg: "SUCCESSFULLY GET SETTLEMENT AMOUNT",
          data
        });
  
    } catch (err) {

      console.error("Error(Get_Settlements_by_Order_ID)", err);
      return res.status(constants.WEB_STATUS_CODE.SERVER_ERROR).send({
        status: constants.STATUS_CODE.ERROR,
        msg: "Something went wrong while creating the payment order.",
        
      });
    }
  }; 