const driver = require('../models/driver.model');
const admin = require('firebase-admin');
const { serviceAccount } = require('../keys/development.keys');
const retry = require('async-retry');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});




async function sendNotificationsToAllDrivers(bookingData) {
  const driverData = await driver.find({ device_token: { $ne: null }, status: 'ACTIVE' });

  const driverTokens = driverData.map((driver) => driver.device_token);

  if (driverTokens.length === 0) {
    console.log('No valid device tokens found. Skipping notifications.');
    return;
  }

  const message = {
    data: {
      title: 'New Booking',
      body: 'New Booking request to drivers',
      bookingData: JSON.stringify(bookingData),
    },
  };

  const retryOptions = {
    retries: 3, 
    minTimeout: 5000, 
  };

  const sendNotificationWithRetry = async () => {
    try {
      for (const token of driverTokens) {
        message.token = token;
        const response = await admin.messaging().send(message);
        console.log(`Notification sent to ${token} successfully:`, response);
      }
    } catch (error) {
      console.error('Error sending notifications:', error);
      throw error; 
    }
  };

  await retry(sendNotificationWithRetry, retryOptions)
    .catch((error) => {
      console.error('Max retries exceeded. Notification not sent.', error);
    });
}



async function sendFCMNotificationToCustomer(Token, driverData) {
    if (!Token) {
        console.error('Device token is null or empty. Notification not sent.');
        return;
    }

    const message = {
        data: {
            title: 'Booking accepted',
            body: 'Booking confirmation by driver',
            driverData: JSON.stringify(driverData),
        },
        token: Token,
    };

    async function sendNotificationWithRetry() {
        try {
            const response = await admin.messaging().send(message);
            console.log('Notification sent successfully:', response);
        } catch (error) {
            console.error('Error sending notification:', error);
            throw error; 
        }
    }

    const retryOptions = {
        retries: 3, 
        minTimeout: 1000, 
        maxTimeout: 5000, 
    };

    await retry(sendNotificationWithRetry, retryOptions)
        .catch((error) => {
            console.error('Max retries exceeded. Notification not sent.', error);
        });
}



module.exports = {sendFCMNotificationToCustomer , sendNotificationsToAllDrivers}