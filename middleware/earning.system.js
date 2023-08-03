
const cron = require('node-cron');


function calculateTotalPrice(distanceInKm, truckType) {
  
  let baseCostPerKm, baseCostPerKm2;

  switch (truckType) {

    case 'dalaauto':
      baseCostPerKm = 18;
      baseCostPerKm2 = 19;
      break;
    case 'tataace':
      baseCostPerKm = 22;
      baseCostPerKm2 = 23;
      break;
    case 'small_pickup':
      baseCostPerKm = 28;
      baseCostPerKm2 = 29;
      break;
   case 'large_pickup':
        baseCostPerKm = 30;
        baseCostPerKm2 = 31;
        break;
    case 'eicher':
      baseCostPerKm = 41;
      baseCostPerKm2 = 42;
      break;
    default:
      throw new Error('Invalid truck type');
  }

  const totalCost = distanceInKm <= 30 ? baseCostPerKm * distanceInKm : baseCostPerKm2 * distanceInKm;
 console.log(totalCost)
  // Calculate the commission (15%)
  const commissionAmount = (totalCost * 15) / 100;
  const costAfterCommission = totalCost + commissionAmount;
  // Calculate the GST (5%)
  const gstAmount = (costAfterCommission * 5) / 100;
  const costAfterGst = costAfterCommission + gstAmount;

  // Calculate the TDS (2%)
  const tdsAmount = (costAfterGst * 2) / 100;
  const finalPrice = costAfterGst + tdsAmount;
  return finalPrice;

}


function totalEarningbyDriver(totalPrice) {
    
   const commissionAmount = (totalPrice * 15) / 100;
   const costAfterCommission = totalPrice - commissionAmount;
  // Calculate the GST (5%)
  const gstAmount = (costAfterCommission * 5) / 100;
  const costAfterGst = costAfterCommission - gstAmount;

  // Calculate the TDS (2%)
  const tdsAmount = (costAfterGst * 2) / 100;
  const finalPrice = costAfterGst - tdsAmount;
  let data = Math.floor(finalPrice)
  return data;

}




// Main function to set up the cron job
function setupCronJob() {
  // Set up the cron job to run every hour from 12:00 AM to 12:00 PM (UTC time)
  cron.schedule('0 0-11 * * *', () => {
    console.log('Cron job started at:', new Date().toLocaleString());
    console.log('Cron job completed at:', new Date().toLocaleString());
  });

  console.log('Cron job set up successfully.');
}

// Call the main function to set up the cron job
setupCronJob();




module.exports = {calculateTotalPrice , totalEarningbyDriver , setupCronJob}; 