const driver = require('../models/driver.model');
const admin = require('firebase-admin');
const { serviceAccount } = require('../keys/development.keys');
const retry = require('retry')
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

  const operation = retry.operation({ retries: 3, minTimeout: 5000 }); // Configure retry options

  return new Promise((resolve, reject) => {
    operation.attempt(async (currentAttempt) => {
      try {
        for (const token of driverTokens) {
          message.token = token;
          // Send the message to the driver's device
          const response = await admin.messaging().send(message);
          console.log(`Notification sent to ${token} successfully:`, response);
        }
        resolve();
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


  async function sendFCMNotificationToCustomer(Token, driverData) {

      const message = {

        data: {
            title: 'Booking accepted',
            body: 'Booking confirmation by driver',
            driverData: JSON.stringify(driverData),
        },
        token: Token
     };
     
        admin.messaging().send(message)
        .then((response) => {
            console.log('Notification sent successfully:', response);
        })
        .catch((error) => {
            console.error('Error sending notification:', error);
        });
 
  }




module.exports = {sendFCMNotificationToCustomer , sendNotificationsToAllDrivers}