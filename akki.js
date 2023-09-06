
// // const FCM = require("fcm-node");
// // const  SERVICE_KEY = "AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj"
// // const fcm = new FCM(SERVICE_KEY);
const admin = require('firebase-admin');
const serviceAccount = {
  "type": "service_account",
  "project_id": "flutter-driver-app-db0db",
  "private_key_id": "528ccb27df131a8c16e4a6459cce948f5676ad6c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjuki5jiOvp5fT\niwHfegfrTscbUaNVAAgnvFpeTlF5WbZjwVA0jiGc4PVjT507rKUUv4lSQwUbYNuy\nXq9ibpN2jAyD/2Gy2Hn9XnORAs6lLQ3WjaxgdEv2A/hk2Wd68huM0A/sj1OueH3h\nypEC784vjJO4HJvSyLYKWxX8QWXW/y6sR+JVoC5t63R/yCDm0l2pQGOJjOUPijJE\nhM2mntKJmKxUxBLlxH/uxyEoXTlJQ+fvgUb4Efno3G2iK0Mjd7tihYhh/SJP6MzP\nDGxZJVXXa4NWfYU5gmtDxUX1tbvJKahbWexohnwCLu9yswlH/7HSufFKHUARf41f\nTeoen4+tAgMBAAECggEAQaQ28gXVst/rVAnAN3uyXxnXY9GIPVTk8CFozbRyn8dj\nA32GjXuKaF4co7NQo5MlIDtmb8+k5YQgsNObV0hj4LxnbChgYBbAWd+bT8EjXj/A\n84sbWBRoO/r9hFlRTo5wkzT7nWkdMK7oMTVIjDfen1uqAb+ejZSgv2gjWV5S2S4T\nNU3hG4Xem/gjn6nNdLtF038YkA7BpT8WhrvXiPRYhfJbiWeD+OdqaiqhegKp+tz8\nlEuCzyqmdIqhW8PGDfjGU2MyvpA1ccA27Lys/uL377C5MJzBtnYl63Fs28JvGkU6\nK8145Hv5QStzLTiByAMkMgOW09X0lsbqL0cJpHS5NQKBgQDdxUsvB3A9ucrFzDpG\nAn37nZJVlWR7ABH3p3mnRFpHo5pJZORD5Nx7Xy6HAMbYmUFbyGru20N8L/cGzm8U\nwtml6Sn0yr5Fugva+XIBV/T5osBZV4iwJRXCODzM3T0fPd46J+U+nKX37VKjjoAf\n2dcA17eTJwnZmkZhkSSK7VzedwKBgQC8/5FvQXQIk2ctgAJLL4oNY9sRKt88m9xP\n89xZ6EkHjH6mUpdB/03+6ft/hT8ZXObQdXW85ffLuUF5lqUBC5TVtDDy/OLUCAa8\nadaxANulSEZpa5UuX4kOyVhH3KVI84Dvbubj9+1ILfOvrvc0wkgZ34uoyNZYiSLP\nojpQ3YFX+wKBgGfKfnV0NcOtwIjyHBPH9s5b4LDNSkmGruIJL5ZpFxeQKhVPcsWT\nxty2nz/vzSByGXSrR+CiHeNxT1uQIczFpLdReKFogcSAXiwNsp2OXMi4su0dWouV\nz6kmSM5YfNKyUd9F7LRw+/wcxiBmAPDnMwjh7Lih/Koq2eWv2Dps/JnhAoGATR0p\nxe863NTn4FS+mtbGyTfZBmQruZsOhUDGw5hXU9ErS8mfFbqJpFzr1NgVKtARDTUf\n2Pcr59+qq2Wf5ZFIJPnkjwBHvKOZu/6jLo1fEU0wDYtrzwQD9BiLAKcyeVWBYjAp\n3RInqq+1IhWNn+U1bfkcDr4DVxR9M6LJkH0QbUkCgYEA0fYmmr/Y7nN4RMVMNINs\nsdSQhRJkqv+OdCyiZrFYEMqpyZcLxIaegATOFKYwtGAEWMm5qkywkCHJyDBOYcNy\nlckzZzafPochE0OVkRZEj3sCi2bpbfl9q3ZlKKODTn4j7a1d5J27oBs1ha4xUMGg\nO0NwFzYPwnnYuRVD2BujuP4=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-jksdj@flutter-driver-app-db0db.iam.gserviceaccount.com",
  "client_id": "115536667596740325379",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jksdj%40flutter-driver-app-db0db.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

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
