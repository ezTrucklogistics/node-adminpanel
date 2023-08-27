const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);
const driver = require("../models/driver.model"); // Replace with the correct path to your Driver model
const User = require("../models/user.model");
const retry = require('retry');
const cron = require('node-cron');


// daily Notification send driver and customer Every 10:00 am
async function sendFCMNotificationsToRecipientsWithRetry(tokens, notificationDetails) {
  const message = {
    notification: {
      title: notificationDetails.title,
      body: notificationDetails.body,
    },
    data: {
      ...notificationDetails.data,
    },
  };

  const operation = retry.operation({
    retries: 3, // Number of retry attempts
    factor: 2, // Exponential backoff factor
    minTimeout: 1000, // Minimum timeout in milliseconds
    maxTimeout: 3000, // Maximum timeout in milliseconds
  });

  return new Promise((resolve, reject) => {
    operation.attempt(async () => {
      try {
        const promises = tokens.map((token) => {
          return new Promise((innerResolve, innerReject) => {
            message.to = token;

            fcm.send(message, function (err, response) {
              if (err) {
                console.error(`Error sending notification to token ${token}: ${err}`);
                innerReject(err);
              } else {
                console.log(`Notification sent to token ${token}.`);
                innerResolve(response);
              }
            });
          });
        });

        await Promise.all(promises);
        resolve(); // All notifications sent successfully
      } catch (error) {
        if (operation.retry(error)) {
          console.warn('Retrying notification send...');
          return;
        }
        console.error('Max retry attempts reached.');
        reject(error);
      }
    });
  });
}


// Define the schedule for sending notifications at 10 AM daily
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
    await sendFCMNotificationsToRecipientsWithRetry(customerTokens, notificationDetails);
    await sendFCMNotificationsToRecipientsWithRetry(driverTokens, notificationDetails);

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
