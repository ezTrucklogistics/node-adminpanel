const admin = require('firebase-admin');
const { serviceAccount } = require('../keys/development.keys');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
const retry = require('retry')
const driver = require("../models/driver.model");
const User = require("../models/user.model");
const cron = require('node-cron');



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

  const operation = retry.operation({ retries: 3 , minTimeout: 5000 }); // Configure retry options

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        const response = await admin.messaging().sendAll(tokens.map((token) => ({ ...message, token })));
        console.log('Notifications sent successfully:', response);
        resolve(response);
      } catch (error) {
        console.error(`Error sending notifications (Attempt ${currentAttempt}):`, error);
        if (operation.retry(error)) {
          console.log('Retrying...');
        } else {
          reject(error);
        }
      }
    });
  });
}



// Define the schedule for sending notifications every day 10:00 AM 
const scheduledJob = cron.schedule('0 10 * * *', async () => {
  try {
    // Retrieve customer and driver tokens from your database
    const customerTokens = await User.find({ device_token: { $exists: true, $ne: null } }).distinct('device_token');
    const driverTokens = await driver.find({ device_token: { $exists: true, $ne: null } }).distinct('device_token');


    const notificationDetails = {
      title: 'Good Morning , Welcome to EzTruck logistices Services',
      body: 'Good morning! Your ride is just a tap away with EzTruck!',
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


