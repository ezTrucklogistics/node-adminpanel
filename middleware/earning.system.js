const booking = require('../models/booking.model')


function calculateTotalPrice(distanceInKm, truckType) {
  
  let baseCostPerKm, baseCostPerKm2;

  switch (truckType) {
    case 'dalaauto':
      baseCostPerKm = 17;
      baseCostPerKm2 = 18;
      break;
    case 'tataace':
      baseCostPerKm = 22;
      baseCostPerKm2 = 23;
      break;
    case 'pickup':
      baseCostPerKm = 26;
      baseCostPerKm2 = 27;
      break;
    case 'eicher':
      baseCostPerKm = 38;
      baseCostPerKm2 = 39;
      break;
    default:
      throw new Error('Invalid truck type');
  }

  const totalCost = distanceInKm <= 30 ? baseCostPerKm * distanceInKm : baseCostPerKm2 * distanceInKm;
 console.log(totalCost)
  // Calculate the commission (15%)
  const commissionAmount = (totalCost * 15) / 100;
  const costAfterCommission = totalCost + commissionAmount;
 console.log(costAfterCommission)
  // Calculate the GST (5%)
  const gstAmount = (costAfterCommission * 5) / 100;
  const costAfterGst = costAfterCommission + gstAmount;
 console.log(costAfterCommission)
  // Calculate the TDS (2%)
  const tdsAmount = (costAfterGst * 2) / 100;
  const finalPrice = costAfterGst + tdsAmount;
  console.log(finalPrice)
  return finalPrice;

}


  
  function calculateTotalPriceInDriver(basePrice) {
    // Calculate the TDS deduction (2%)
    const tdsAmount = (basePrice * 2) / 100;
    const finalPrice = basePrice - tdsAmount;
  
    return finalPrice;
  }
  


module.exports = {calculateTotalPriceInDriver , calculateTotalPrice}; 