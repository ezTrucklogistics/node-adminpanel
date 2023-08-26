const driver = require('../models/driver.model');
const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const { database } = require('firebase-admin');
const fcm = new FCM(SERVICE_KEY);


function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  console.log(earthRadius * c)
  return earthRadius * c;
}

const findDriver = async () => {

    const data = await driver.find();
    const token = data.map((drivers) => drivers.device_token)
    console.log(token)
    return token
}


const findDriverCurrentLocation = async (pickup_location , drop_location) => {

  const data = await driver.find();
  const token = data.map((data) => calculateDistance(pickup_location , drop_location , data.driver_lat, data.driver_long))
  console.log(token);
  return token;

}


//  const sendFCMNotificationToDriver = async () =>  {
  
//   const message = {
//     to: findDriver(),
//     notification: {
//       title: 'New Booking Request',
//       body: 'You have a new booking request.',
//     },
//   };

//   // Send the notification
//   fcm.send(message, function (err, response) {
//     if (err) {
//       console.error(`Error sending notification to driver: ${err}`);
//     } else {
//       console.log(`Notification sent to driver.` , response);
//     }
//   });
// }

// const findDriversWithinRadius = async (pickupLat, pickupLon, radius) => {
//   const drivers = await driver.find()
//   // console.log(drivers)
//   const driversWithinRadius = drivers.filter((data) => {
//     const distance = calculateDistance(pickupLat, pickupLon, data.driver_lat, data.driver_long);
//     return driver.driver_status && distance <= radius;
//   });
//   // console.log(driversWithinRadius)
//   return driversWithinRadius;
// }


// const sendNotificationsToDrivers = async (pickupLat, pickupLon, maxRadius) => {

//   let currentRadius = 0;

//   while (currentRadius <= maxRadius) {
//     const driversWithinRadius = findDriversWithinRadius(pickupLat, pickupLon, currentRadius);

//     if (driversWithinRadius.length > 0) {
//       console.log(`Found drivers within ${currentRadius} km radius, sending notifications.`);
//        sendFCMNotificationToDriver()
//       break;
//     } else {
//       console.log(`No drivers found within ${currentRadius} km radius.`);

//       // Increase the search radius by 5 km, up to the maximum specified
//       currentRadius += 5;

//       if (currentRadius > maxRadius) {
//         console.log(`No drivers found within the maximum radius of ${maxRadius} km.`);
//         // Handle the case where no drivers are found even within the maximum radius.
//         break;
//       }
//     }
//   }
// }




  module.exports = {   calculateDistance , findDriverCurrentLocation , findDriver}