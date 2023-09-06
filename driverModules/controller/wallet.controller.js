const constants = require('../../config/constants')
const { sendResponse } = require("../../services/common.service");;
const driver = require("../../models/driver.model");
const booking = require("../../models/booking.model")
const wallet = require('../../models/wallet.model')
const cron = require('node-cron');



exports.create_wallet = async (req , res) => {

    try {
        
        let reqBody = req.body;
        const drivers = req.drivers._id;
        reqBody.driverId = drivers;
        const wallets = await wallet.create(reqBody)
       
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'WALLET.wallet_created', wallets , req.headers.lang);
      } catch (err) {
        console.log("Error(create_wallet)", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
      }
}


                
exports.get_wallet = async (req , res) => {

    try {
        
        const { walletId } = req.query;
         const wallets = await wallet.findOne({_id: walletId }).populate('driver' , 'driver_name driver_email driver_mobile_number');

         const drivers = await driver.findOne({_id : wallets.driver})
         const earnings = drivers.earning
         const sum = earnings.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
         wallets.daily_earning = sum;
         wallets.monthly_earning = sum;
         await wallets.save()
       
        return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'WALLET.get_wallet', wallets , req.headers.lang);
      } catch (err) {
        console.log("Error(get_wallet)", err);
        return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
      }
}


exports.get_earning_in_daily = async (req , res) => {

  try {
      
      const { driverId } = req.query;
       const wallets = await wallet.findOne({driver : driverId }).populate('driver' , 'driver_name driver_email driver_mobile_number');
       wallets._id = undefined;
       wallets.__v = undefined;
       wallets.date = undefined;
       wallets.driver._id = undefined;
     
      return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'WALLET.get_wallet', wallets , req.headers.lang);
    } catch (err) {
      console.log("Error(get_earning_in_daily)", err);
      return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}


