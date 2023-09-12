
// // const FCM = require("fcm-node");
// // const  SERVICE_KEY = "AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj"

// async function sendFCMNotificationToCustomer() {

//   let  registrationToken = "ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt"

//   const message = {
    
//     data: {
//         title: 'Booking accepted',
//         body: 'Booking confirmation by driver',
//     },
//     token: registrationToken
//  };
 
//     admin.messaging().send(message)
//     .then((response) => {
//         console.log('Notification sent successfully:', response);
//     })
//     .catch((error) => {
//         console.error('Error sending notification:', error);
//     });

// }
  

// sendFCMNotificationToCustomer()


// // function calculateDistance(lat1, lon1, lat2, lon2) {
// //   const R = 6371; // Radius of the Earth in kilometers
// //   const dLat = toRadians(lat2 - lat1);
// //   const dLon = toRadians(lon2 - lon1);

// //   const a =
// //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
// //     Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
// //     Math.sin(dLon / 2) * Math.sin(dLon / 2);

// //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// //   // Calculate the distance
// //    const distance = R * c;
// //    console.log(distance)
// //    return distance;
// // }

// // // Function to convert degrees to radians
// // function toRadians(degrees) {
// //   return degrees * (Math.PI / 180);
// // }


// // async function sendFCMNotificationToDriver(driverToken, bookingDetails) {
// //   // Construct the notification message
// //   const message = {
// //       to: driverToken,
// //       notification: {
// //         title: 'New Booking Request',
// //         body: 'You have a new booking request.',
// //       },
// //       data: {
// //         // Include booking details here
// //         ...bookingDetails,
// //       },
// //     }

// //     console.log(message.data)

// //      // Send the notification
// //     try {
// //       fcm.send(message, function (err, response) {
// //         if (err) {
// //           console.error(`Error sending notification to driver: ${err}`);
// //         } else {
// //           console.log(`Notification sent to driver.`);
// //         }
// //       });
// //     } catch (error) {
// //       console.error(`Error sending notification to driver: ${error}`);
// //     }
// // }


// // async function findDriversWithinRadius(pickupLat, pickupLon, radius) {
// //   const drivers = await driver.find();
// //   const driversWithinRadius = drivers.map((driver) => {
// //     const distance = calculateDistance(pickupLat, pickupLon, driver.driver_lat, driver.driver_long);
// //        return driver.driver_status && distance <= radius;
// //   });
// //    return driversWithinRadius;
// // }


// // exports.sendNotificationsToDrivers  = async (pickupLat, pickupLon, maxRadius , bookingDetails) => {

// //   let currentRadius = 0;
// //   while (currentRadius <= maxRadius) {
// //     const driversWithinRadius = findDriversWithinRadius(pickupLat, pickupLon, currentRadius);

// //     if (driversWithinRadius.length > 0) {
// //       console.log(`Found drivers within ${currentRadius} km radius, sending notifications.`);
// //       // Send notifications to each driver found
// //       for (const driver of driversWithinRadius) {
// //         const driverToken = driver.device_token;

// //         await sendFCMNotificationToDriver(driverToken, bookingDetails);
// //       }

// //       break;
// //     } else {
// //       console.log(`No drivers found within ${currentRadius} km radius.`);

// //       // Increase the search radius by 5 km, up to the maximum specified
// //       currentRadius += 5;

// //       if (currentRadius > maxRadius) {
// //         console.log(`No drivers found within the maximum radius of ${maxRadius} km.`);
// //         break;
// //       }
// //     }
// //   }
// // }


// const axios = require('axios');
// const secretKey = 'prakash'; // Replace with your Secret Key

// // Middleware to verify CAPTCHA
// async function verifyCaptcha(req, res, next) {
//   const captchaResponse = req.body['g-recaptcha-response'];

//   try {
//     const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
//       params: {
//         secret: secretKey,
//         response: captchaResponse,
//       },
//     });

//     if (response.data.success) {
//       // CAPTCHA verification passed
//       next();
//     } else {
//       // CAPTCHA verification failed
//       res.status(400).json({ error: 'CAPTCHA verification failed' });
//     }
//   } catch (error) {
//     console.error('Error verifying CAPTCHA:', error);
//     res.status(500).json({ error: 'CAPTCHA verification error' });
//   }
// }

// const User = require('./models/user'); // Import your user model

// async function loginMiddleware(req, res, next) {
//   try {
//     const { username, password } = req.body;
//     const user = await User.findOne({ username });

//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     if (user.isLockedOut) {
//       const lockoutDuration = user.lockoutTime - new Date();
//       return res.status(401).json({
//         message: `Account locked. Try again in ${lockoutDuration / 1000} seconds.`,
//       });
//     }

//     // Implement your password validation logic here

//     if (password !== user.password) {
//       user.failedLoginAttempts++;
//       if (user.failedLoginAttempts >= 3) {
//         user.isLockedOut = true;
//         user.lockoutTime = new Date(Date.now() + 5 * 60 * 1000); // Lockout for 5 minutes
//       }
//       await user.save();
//       return res.status(401).json({ message: 'Invalid credentials' });
//     }

//     // Successful login
//     user.failedLoginAttempts = 0;
//     user.isLockedOut = false;
//     await user.save();

//     // Continue to the next middleware
//     next();
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Server error' });
//   }
// }

// module.exports = loginMiddleware;

function calculateDistance(lat1, lon1, lat2, lon2) {
  const earthRadiusKm = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

// Example usage:
const distance = calculateDistance(52.5200, 13.4050, 48.8566, 2.3522);
console.log(`Distance: ${distance} km`);
