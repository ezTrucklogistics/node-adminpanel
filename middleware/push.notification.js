const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);
const driver = require("../models/driver.model"); // Replace with the correct path to your Driver model
const User = require("../models/user.model");
const { CronJob } = require('cron');
const retry = require('retry');



exports.calculateDistance = (lat1, lon1, lat2, lon2) => {

  const R = 6371; 
  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);
  const deltaLat = toRadians(lat2 - lat1);
  const deltaLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c; // Distance in kilometers
  return distance;
}

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}



exports.sendNotificationToDrivers = async () => {
  
  try {
    // Find active drivers from the database
    const drivers = await driver.find();

    // Extract deviceTokens from active drivers
    const driverDeviceTokens = drivers.map(
       (data) => data.device_token
    );

    // Example usage:
    const notification_msg = {
      title: "EZTRUCK LOGISTIC SERVICE",
      body: "Good morning! 🌞 Your safety is our priority. Please remember to fasten your seatbelt during the ride. If you have any concerns, feel free to let me know.",
    };
    const message = {
      registration_ids:  driverDeviceTokens,
      data: notification_msg, // Include additional data here, e.g., bookingId
    };

    const operation = retry.operation({
      retries: 3, // Number of retry attempts
      factor: 2, // Exponential backoff factor
      minTimeout: 1000, // Minimum time between retries (in milliseconds)
    });

    operation.attempt(async (currentAttempt) => {
      try {
        const response = await sendNotification(message);

        console.log(
          `Notification sent successfully to all customers on attempt ${currentAttempt}`,
          response
        );
      } catch (err) {
        if (operation.retry(err)) {
          console.error(
            `Failed to send notification, retrying (attempt ${currentAttempt})`
          );
        } else {
          console.error(
            `Notification sending failed after ${currentAttempt} attempts:`,
            err
          );
        }
      }
    });
  } catch (err) {
    console.error("Error finding customers for notifications:", err);
  }
};




exports.sendNotificationToCustomers = async () => {

  try {
    // Find active drivers from the database
    const customers = await User.find();

    // Extract deviceTokens from active drivers
    const customerDeviceTokens = customers.map(
       (customer) => customer.device_token
    );

    // Example usage:
    const notification_msg = {
      title: "EZTRUCK LOGISTIC SERVICE",
      body: "Good morning! 🌞 Your reliable ride is just a tap away. Here's your ride information for today:",
    };
    const message = {
      registration_ids: customerDeviceTokens,
      data: notification_msg, // Include additional data here, e.g., bookingId
    };

    const operation = retry.operation({
      retries: 3, // Number of retry attempts
      factor: 2, // Exponential backoff factor
      minTimeout: 1000, // Minimum time between retries (in milliseconds)
    });

    operation.attempt(async (currentAttempt) => {
      try {
        const response = await sendNotification(message);

        console.log(
          `Notification sent successfully to all customers on attempt ${currentAttempt}`,
          response
        );
      } catch (err) {
        if (operation.retry(err)) {
          console.error(
            `Failed to send notification, retrying (attempt ${currentAttempt})`
          );
        } else {
          console.error(
            `Notification sending failed after ${currentAttempt} attempts:`,
            err
          );
        }
      }
    });
  } catch (err) {
    console.error("Error finding customers for notifications:", err);
  }
};





// Schedule the cron job to run every day at 10:00 AM send notification driver and customer
new CronJob ("0 10 * * *", () => {
  sendNotificationToCustomers()
  sendNotificationToDrivers()
} , null, true, 'Asia/Kolkata');
