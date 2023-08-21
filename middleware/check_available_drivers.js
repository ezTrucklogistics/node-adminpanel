const driver = require('../models/driver.model');
const constants = require('../config/constants')
const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);
const retry = require('retry');



const  findDriversWithinRadius = async (pickupLat, pickupLon, radius) => {
  // Define the customer location
  const customerLocation = {
    type: 'Point',
    coordinates: [pickupLon, pickupLat], // [longitude, latitude]
  };

  // Find drivers within the specified radius
  const driversWithinRadius = await driver.find({
    location: {
      $near: {
        $geometry: customerLocation,
        $maxDistance: radius * 1000, // Convert km to meters
      },
    },
    driver_status: constants.DRIVER_STATUS.STATUS_1, // Filter by driver availability
  });

  return driversWithinRadius;
}



const sendFCMNotificationToDriver = async (driverToken ,bookingDetails) => {


    const message = {

        token: driverToken,
        notification: {
          title: 'New Booking Request',
          body: 'You have a new booking request.',
        },
        data: {
          // Include booking details here
          // For example, you can pass booking ID, customer ID, etc.
          ...bookingDetails,
        },
      };
  
      fcm.send(message, function (err, response) {
        if (err) {
          console.error("Error sending notification:", err);
        } else {
          console.log("Notification sent successfully:", response);
        }
      });
  
}

const  sendNotificationsToDrivers =  async(pickupLat, pickupLon, radius) => {

  const driversWithinRadius = await findDriversWithinRadius(
    pickupLat,
    pickupLon,
    radius
  );

  if (driversWithinRadius.length === 0) {
    // No drivers found within the current radius, expand the radius by 5 km
    const expandedRadius = radius + 5;

    if (expandedRadius <= 15) {
      console.log(`No drivers found within ${radius} km radius. Expanding to ${expandedRadius} km.`);
      await sendNotificationsToDrivers(pickupLat, pickupLon, expandedRadius);
    } else {
      console.log(`No drivers found within the maximum radius of 15 km.`);
      // Handle the case where no drivers are found even within the maximum radius.
    }
  } else {
    console.log(`Found drivers within ${radius} km radius, sending notifications.`);
    
    // Send notifications to each driver found
    for (const driver of driversWithinRadius) {
      // Assuming each driver document has a "deviceToken" field
      const driverToken = driver.device_token; // Replace with the actual field name

      // You can customize the bookingDetails object with relevant information
      const bookingDetails = {
        customerId: '123', // Replace with actual customer ID
        // Add other booking details as needed
      };

      await sendFCMNotificationToDriver(driverToken, bookingDetails);
    }
  }
}


exports.sendNotificationsToDrivers(pickupLat, pickupLon, initialRadius)

  .then(() => {
    console.log('sucessfully send notification to the driver');
  })
  .catch((error) => {
    console.error('Error sending notifications:', error);
  });
