const driver = require('../models/driver.model');
const constants = require('../config/constants')
const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);
const retry = require('retry');



const findDriversWithinRadius = async (pickup_location_lat, pickup_location_long, radius) => {
  // Define the customer location
  const customerLocation = {
    type: 'Point',
    coordinates: [pickup_location_long, pickup_location_lat], // [longitude, latitude]
  };

  console.log(customerLocation)
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
  
  console.log(driversWithinRadius)
  return driversWithinRadius;
}



const sendFCMNotificationToDriver = async (driverToken ) => {


    const message = {

        token: driverToken,
        notification: {
          title: 'New Booking Request',
          body: 'You have a new booking request.',
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


const sendNotificationsToDrivers =  async (pickup_location_lat, pickup_location_long, radius) => {

  const driversWithinRadius = await findDriversWithinRadius(
    pickup_location_lat,
    pickup_location_long,
    radius
  );

  console.log(driversWithinRadius);

  if (driversWithinRadius.length === 0) {
    // No drivers found within the current radius, expand the radius by 5 km
    const expandedRadius = radius + 5;

    if (expandedRadius <= 15) {
      console.log(`No drivers found within ${radius} km radius. Expanding to ${expandedRadius} km.`);
      await sendNotificationsToDrivers(pickup_location_lat, pickup_location_long, expandedRadius);
    } else {
      console.log(`No drivers found within the maximum radius of 15 km.`);
      // Handle the case where no drivers are found even within the maximum radius.
    }
  } else {
    console.log(`Found drivers within ${radius} km radius, sending notifications.`);
    
    // Send notifications to each driver found
    for (const driver of driversWithinRadius) {
      // Assuming each driver document has a "deviceToken" field
      const driverToken = driver.device_token; // Replace with the actual field na
      await sendFCMNotificationToDriver(driverToken, bookingDetails);
    }
  }
}

const pickupLat = 52.5200; // Customer pickup location latitude
const pickupLon = 13.4050; // Customer pickup location longitude
const initialRadius = 10; // Initial search radius in kilometers

sendNotificationsToDrivers(pickupLat, pickupLon, initialRadius)
  .then(() => {
    // Handle success
  })
  .catch((error) => {
    console.error('Error sending notifications:', error);
  });