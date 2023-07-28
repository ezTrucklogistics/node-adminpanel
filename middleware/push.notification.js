

const FCM = require('fcm-node');
const serverKey = 'YOUR_SERVER_KEY'; // Replace with your Firebase server key
const fcm = new FCM(serverKey);
const driver = require('./models/driver'); // Replace with the correct path to your Driver model
const booking = require('../models/booking.model');




// Function to send notification to active drivers
async function sendNotificationToActiveDrivers(notificationData) {

  try {

    // Find active drivers from the database
    const activeDrivers = await driver.find({ status : "ACTIVE" });

    // Extract deviceTokens from active drivers
    const driverDeviceTokens = activeDrivers.map(driver => driver.deviceToken);

    const message = {
      registration_ids: driverDeviceTokens,
      data: notificationData, // Include additional data here, e.g., bookingId
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.error('Error sending notification:', err);
      } else {
        console.log('Notification sent successfully:', response);
      }
    });
  } catch (err) {
    console.error('Error finding active drivers:', err);
  }
}

// Example usage:
const notificationData = {
  title: 'New Booking Request',
  body: 'You have a new booking request. Accept or decline?',
  bookingId: 'BOOKING_ID', // Include bookingId to identify the booking request
};

exports.sendNotificationToActiveDriver = sendNotificationToActiveDrivers(notificationData);


async function sendNotificationToDrivers(notification) {

  try {

    // Find active drivers from the database
    const activeDrivers = await driver.find();

    // Extract deviceTokens from active drivers
    const driverDeviceTokens = activeDrivers.map(driver => driver.deviceToken);

    const message = {
      registration_ids: driverDeviceTokens,
      data: notification, // Include additional data here, e.g., bookingId
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.error('Error sending notification:', err);
      } else {
        console.log('Notification sent successfully all the drivers :', response);
      }
    });
  } catch (err) {
    console.error('Error find in drivers notifications:', err);
  }
}

// Example usage:
const notification = {
  title: 'New Booking Request',
  body: 'You have a new booking request. Accept or decline?',
};

exports.sendNotificationToDriver = sendNotificationToDrivers(notification);




exports.findAcceptedDriversByBookingId = async (driverId , bookingId) => {

  try {
    
    let driverdata =  await driver.find({driverId});
    const acceptedDrivers = await booking.find({ bookingId });
    acceptedDrivers.driverId = driverdata._id
    await acceptedDrivers.save()
    return acceptedDrivers;

  } catch (err) {

    console.error('Error finding accepted drivers:', err);
    return [];
  }

}



