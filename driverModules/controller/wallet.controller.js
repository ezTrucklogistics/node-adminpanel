const constants = require('../../config/constants')
const { sendResponse } = require("../../services/common.service");;
const driver = require("../../models/driver.model");
const cron = require('node-cron');

function calculateMoneySum(moneyArray) {
  // Implement your sum calculation logic here
  return moneyArray.reduce((total, amount) => total + amount, 0);
}


exports.get_earning = async (req , res) => {

  try {
      
        // Retrieve all drivers from the database
    const drivers = await driver.find();
    console.log(drivers)

    // Iterate through each driver and calculate the sum of their money
    for (const driverdata of drivers) {
      const moneySum = calculateMoneySum(driverdata.earning);

      // Update the driver's wallet in the database using findByIdAndUpdate
      await driverdata.findOneAndUpdate(driverdata._id, { wallet: moneySum });
    }
      return sendResponse(res, constants.WEB_STATUS_CODE.OK, constants.STATUS_CODE.SUCCESS, 'WALLET.get_wallet', {} , req.headers.lang);

    } catch (err) {
      console.log("Error(get_earning)", err);
      return sendResponse(res, constants.WEB_STATUS_CODE.SERVER_ERROR, constants.STATUS_CODE.FAIL, 'GENERAL.general_error_content', err.message, req.headers.lang)
    }
}



