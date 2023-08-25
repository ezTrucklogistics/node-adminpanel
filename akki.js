// Sample driver data (replace with your actual driver data)


const drivers = [
    { id: '1', latitude: 20.272610, longitude: 85.833122, isAvailable: true, deviceToken: 'ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt' },
    { id: '2', latitude: 20.272610, longitude: 85.833122, isAvailable: true, deviceToken: 'ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt' },
    { id: '3', latitude: 20.272610, longitude: 85.833122, isAvailable: true, deviceToken: 'ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt' },
    // Add more driver data as needed
  ];

  let serverKey = "AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj"
  const FCM = require('fcm-node')
  const retry = require('retry');
  const driver = require("./models/driver.model")
  const cron = require('node-cron')


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
  
  function findDriversWithinRadius(pickupLat, pickupLon, radius) {
    const driversWithinRadius = drivers.filter((driver) => {
      const distance = calculateDistance(pickupLat, pickupLon, driver.latitude, driver.longitude);
      return driver.isAvailable && distance <= radius;
    });
  
    return driversWithinRadius;
  }
  

  async function sendNotificationsToDrivers(pickupLat, pickupLon, maxRadius) {
    
    let currentRadius = 0;
  
    while (currentRadius <= maxRadius) {
      const driversWithinRadius = findDriversWithinRadius(pickupLat, pickupLon, currentRadius);
  
      if (driversWithinRadius.length > 0) {
        console.log(`Found drivers within ${currentRadius} km radius, sending notifications.`);
  
        // Send notifications to each driver found
        for (const driver of driversWithinRadius) {
          const driverToken = driver.deviceToken;
          const bookingDetails = {
            customerId: '123', // Replace with actual customer ID
            // Add other booking details as needed
          };
  
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
  
  // Example usage:
  const pickupLat = 20.241060; // Customer pickup location latitude
  const pickupLon = 85.787960; // Customer pickup location longitude
  const initialRadius = 30; // Initial search radius in kilometers
  
  sendNotificationsToDrivers(pickupLat, pickupLon, initialRadius)
    .then(() => {
      // Handle success
    })
    .catch((error) => {
      console.error('Error sending notifications:', error);
    });
  
  
  