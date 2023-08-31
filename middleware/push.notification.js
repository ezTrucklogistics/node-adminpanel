const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);
const driver = require("../models/driver.model"); // Replace with the correct path to your Driver model
const User = require("../models/user.model");
const cron = require('node-cron');



// Function to send FCM notifications to multiple recipients
async function sendFCMNotificationsToRecipients(tokens, notificationDetails) {

  const message = {
    notification: {
      title: notificationDetails.title,
      body: notificationDetails.body,
    },
    data: {
      ...notificationDetails.data,
    },
  };

  const promises = tokens.map((token) => {
    return new Promise((resolve, reject) => {
      message.to = token;

      fcm.send(message, function (err, response) {
        if (err) {
          console.error(`Error sending notification to token ${token}: ${err}`);
          reject(err); // Reject the promise if there's an error
        } else {
          console.log(`Notification sent to token ${token}.`);
          resolve(response); // Resolve the promise if successful
        }
      });
    });
  });

  return Promise.all(promises);
}

// Define the schedule for sending notifications every day 10:00 AM 
const scheduledJob = cron.schedule('0 10 * * *', async () => {
  try {
    // Retrieve customer and driver tokens from your database
    const customerTokens = await User.find({ device_token: { $exists: true, $ne: null } }).distinct('device_token');
    const driverTokens = await driver.find({ device_token: { $exists: true, $ne: null } }).distinct('device_token');


    const notificationDetails = {
      title: 'Your Minute Notification',
      body: 'This is your notification sent every minute.',
      data: {
        // Include additional data as needed
      },
    };

    // Send notifications to both customers and drivers
    await sendFCMNotificationsToRecipients(customerTokens, notificationDetails);
    await sendFCMNotificationsToRecipients(driverTokens, notificationDetails);

    console.log('Minute notifications sent successfully to both customers and drivers.');
  } catch (error) {
    console.error('Error sending minute notifications:', error);
  }
});

// Start the scheduled job
scheduledJob.start();

// Optionally, you can listen for job completion events
scheduledJob.on('complete', () => {
  console.log('Scheduled job completed.');
});

// Handle process termination gracefully (optional)
process.on('SIGINT', () => {
  // Stop the scheduled job before exiting
  scheduledJob.stop();
  process.exit();

});


