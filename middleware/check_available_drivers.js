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

<<<<<<< HEAD

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadius = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
}


async function sendFCMNotificationToDriver(driverToken, bookingDetails) {
  // Construct the notification message
  const message = {
      to: driverToken,
      notification: {
        title: 'New Booking Request',
        body: 'You have a new booking request.',
      },
      data: {
        // Include booking details here
        ...bookingDetails,
      },
    };
  console.log(message.data)
    // Send the notification
    try {
      fcm.send(message, function (err, response) {
        if (err) {
          console.error(`Error sending notification to driver: ${err}`);
        } else {
          console.log(`Notification sent to driver.`);
        }
      });
    } catch (error) {
      console.error(`Error sending notification to driver: ${error}`);
    }
}

async function findDriversWithinRadius(pickupLat, pickupLon, radius) {
  const drivers = await driver.find();
  const driversWithinRadius = drivers.map((driver) => {
    const distance = calculateDistance(pickupLat, pickupLon, driver.latitude, driver.longitude);
    if(driver.driver_status === "available"){
       return driver.driver_status && distance <= radius;
    }
  });

  return driversWithinRadius;

}

exports.sendNotificationsToDrivers  = async (pickupLat, pickupLon, maxRadius , bookingDetails) => {

  let currentRadius = 0;
  while (currentRadius <= maxRadius) {
    const driversWithinRadius = findDriversWithinRadius(pickupLat, pickupLon, currentRadius);

    if (driversWithinRadius.length > 0) {
      console.log(`Found drivers within ${currentRadius} km radius, sending notifications.`);

      // Send notifications to each driver found
      for (const driver of driversWithinRadius) {
        const driverToken = driver.deviceToken;
        await sendFCMNotificationToDriver(driverToken, bookingDetails);
      }

      // Drivers found, exit the loop
      break;
    } else {
      console.log(`No drivers found within ${currentRadius} km radius.`);

      // Increase the search radius by 5 km, up to the maximum specified
      currentRadius += 5;

      if (currentRadius > maxRadius) {
        console.log(`No drivers found within the maximum radius of ${maxRadius} km.`);
        // Handle the case where no drivers are found even within the maximum radius.
        break;
      }
    }
  }
}


exports.sendFCMNotificationToCustomer = async (customerToken, driverData) => {
  // Construct the notification message for the customer
  const message = {
    to: customerToken,
    notification: {
      title: 'Booking Accepted',
      body: 'Your booking request has been accepted by the driver.',
    },
    data: {
      // Include driver data here
      ...driverData,
    },
  };

  // Send the notification to the customer
  try {
    fcm.send(message, function (err, response) {
      if (err) {
        console.error(`Error sending notification to customer: ${err}`);
      } else {
        console.log(`Notification sent to customer.`);
      }
    });
  } catch (error) {
    console.error(`Error sending notification to customer: ${error}`);
  }
}
=======
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
>>>>>>> 40d7b2aaac5aaa8babedc00a0025a5db58665699
