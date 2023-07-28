// const axios = require('axios');

// const PAN_VERIFICATION_API_URL = 'https://incometaxindiaefiling.gov.in/e-Filing/Services/KnowYourJurisdiction.html';

// async function verifyPANCard(panNumber) {
//   const credentials = {
//     username: '', // Replace with your API username
//     password: 'YourPassword', // Replace with your API password
//   };

//   const payload = {
//     pan: panNumber,
//   };

//   try {
//     const response = await axios.post(PAN_VERIFICATION_API_URL, payload, {
//       auth: credentials,
//     });

//     // The response will contain the verification status and other details
//     const verificationStatus = response.data.status;
//     const details = response.data.result;

//     if (verificationStatus === 'P') {
//       console.log('PAN Card is valid.');
//       console.log('Details:', details);
//     } else {
//       console.log('PAN Card is not valid.');
//     }
//   } catch (error) {
//     console.error('Error verifying PAN Card:', error.message);
//   }
// }

// const panNumber = 'ABCDE1234F'; // Replace with the PAN number you want to verify

// let data = verifyPANCard(panNumber);
// console.log(data)





// function calculateFinalAmount(totalPrice) {

//    const commissionAmount = (totalPrice * 15) / 100;
//   const costAfterCommission = totalPrice - commissionAmount;
//   // Calculate the GST (5%)
//   const gstAmount = (costAfterCommission * 5) / 100;
//   const costAfterGst = costAfterCommission - gstAmount;

//   // Calculate the TDS (2%)
//   const tdsAmount = (costAfterGst * 2) / 100;
//   const finalPrice = costAfterGst - tdsAmount;

//    return finalPrice;
// }

// let data = calculateFinalAmount(20000)
// console.log(data)

// async function calculateDriverDailyEarnings(driverId) {

//   try {

//     const today = new Date();
//     today.setHours(0, 0, 0, 0);

//     // Find all trips accepted by the driver for today
//     const trips = await Trip.find({ driver: driverId, createdAt: { $gte: today } });

//     // Calculate the driver's daily earnings
//     const dailyEarnings = trips.reduce((acc, trip) => acc + trip.driverEarnings, 0);

//     return dailyEarnings;
//   } catch (err) {
//     throw err;
//   }
// }



const cron = require('node-cron');



cron.schedule('* * * * *', () =>  {
  console.log('stopped task');
})

