const driver = require('../models/driver.model');
const constants = require('../config/constants')
const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);
const retry = require('retry');




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

async function findDriversWithinRadius(pickupLat, pickupLon, radius) {
    const drivers = await driver.find()
    const driversWithinRadius = drivers.filter((driver) => {
    const distance = calculateDistance(pickupLat, pickupLon, driver.driver_lat, driver.driver_lat);
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


