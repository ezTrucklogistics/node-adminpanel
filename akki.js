
// const FCM = require("fcm-node");
// const  SERVICE_KEY = "AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj"
// const fcm = new FCM(SERVICE_KEY);



// async function sendNotificationsToAllDrivers(customData) {

//     try {
//       // Retrieve driver tokens from your data source (e.g., database)
//       const driverTokens = [
//         "dAS0FSg1Q2SAQG-V1DE7th:APA91bHpjjRbxRw9UIdKLkupn7hDET8yKEEO2zK1qHpLVCfcdSPCKSPLSh5b766-xjgnqAYB6w688yI5BnGYSFcO1H63jKu_ayBqSWcgd6RJngOs9wk7f0_9Ix6V8ieu-uxy0tHoQl1T",
//         "dAS0FSg1Q2SAQG-V1DE7th:APA91bHpjjRbxRw9UIdKLkupn7hDET8yKEEO2zK1qHpLVCfcdSPCKSPLSh5b766-xjgnqAYB6w688yI5BnGYSFcO1H63jKu_ayBqSWcgd6RJngOs9wk7f0_9Ix6V8ieu-uxy0tHoQl1T"
//       ];
  
//       // Construct the notification message
//       const message = {
//         registration_ids: driverTokens, // Send to all driver tokens
//         notification: {
//           title: "hello",
//           body: "new bookings",
//         },
//         data: {
//           // Include any additional data here
//           customData:customData,
//         },
//       };
  
//       // Send notifications to all drivers
//       fcm.send(message, (err, response) => {
//         if (err) {
//           console.error('Error sending notifications to drivers:', err);
//         } else {
//           console.log('Notifications sent to drivers:', response);
//         }
//       });
      
//     } catch (error) {
//       console.error('Error sending notifications to drivers (try-catch):', error);
//     }
//   }
  
// let driverData = {
//    pickUplat:20.27241,
//    pickuplong:85.83385,
//    customer_name:"prakash",
//    customer_mobile_number:"6371704662",
// }


// sendNotificationsToAllDrivers(driverData)
// .then(() => {
//   console.log('Notification send successfully')
// })
// .catch((error) => {
//   console.error('Error sending notifications:', error);
// });





// function calculateDistance(lat1, lon1, lat2, lon2) {
//   const R = 6371; // Radius of the Earth in kilometers
//   const dLat = toRadians(lat2 - lat1);
//   const dLon = toRadians(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
//     Math.sin(dLon / 2) * Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

//   // Calculate the distance
//    const distance = R * c;
//    console.log(distance)
//    return distance;
// }

// // Function to convert degrees to radians
// function toRadians(degrees) {
//   return degrees * (Math.PI / 180);
// }


// async function sendFCMNotificationToDriver(driverToken, bookingDetails) {
//   // Construct the notification message
//   const message = {
//       to: driverToken,
//       notification: {
//         title: 'New Booking Request',
//         body: 'You have a new booking request.',
//       },
//       data: {
//         // Include booking details here
//         ...bookingDetails,
//       },
//     }

//     console.log(message.data)

//      // Send the notification
//     try {
//       fcm.send(message, function (err, response) {
//         if (err) {
//           console.error(`Error sending notification to driver: ${err}`);
//         } else {
//           console.log(`Notification sent to driver.`);
//         }
//       });
//     } catch (error) {
//       console.error(`Error sending notification to driver: ${error}`);
//     }
// }


// async function findDriversWithinRadius(pickupLat, pickupLon, radius) {
//   const drivers = await driver.find();
//   const driversWithinRadius = drivers.map((driver) => {
//     const distance = calculateDistance(pickupLat, pickupLon, driver.driver_lat, driver.driver_long);
//        return driver.driver_status && distance <= radius;
//   });
//    return driversWithinRadius;
// }


// exports.sendNotificationsToDrivers  = async (pickupLat, pickupLon, maxRadius , bookingDetails) => {

//   let currentRadius = 0;
//   while (currentRadius <= maxRadius) {
//     const driversWithinRadius = findDriversWithinRadius(pickupLat, pickupLon, currentRadius);

//     if (driversWithinRadius.length > 0) {
//       console.log(`Found drivers within ${currentRadius} km radius, sending notifications.`);
//       // Send notifications to each driver found
//       for (const driver of driversWithinRadius) {
//         const driverToken = driver.device_token;

//         await sendFCMNotificationToDriver(driverToken, bookingDetails);
//       }

//       break;
//     } else {
//       console.log(`No drivers found within ${currentRadius} km radius.`);

//       // Increase the search radius by 5 km, up to the maximum specified
//       currentRadius += 5;

//       if (currentRadius > maxRadius) {
//         console.log(`No drivers found within the maximum radius of ${maxRadius} km.`);
//         break;
//       }
//     }
//   }
// }


const axios = require('axios');
const secretKey = 'prakash'; // Replace with your Secret Key

// Middleware to verify CAPTCHA
async function verifyCaptcha(req, res, next) {
  const captchaResponse = req.body['g-recaptcha-response'];

  try {
    const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
      params: {
        secret: secretKey,
        response: captchaResponse,
      },
    });

    if (response.data.success) {
      // CAPTCHA verification passed
      next();
    } else {
      // CAPTCHA verification failed
      res.status(400).json({ error: 'CAPTCHA verification failed' });
    }
  } catch (error) {
    console.error('Error verifying CAPTCHA:', error);
    res.status(500).json({ error: 'CAPTCHA verification error' });
  }
}

