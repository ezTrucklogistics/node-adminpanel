const driver = require('../models/driver.model');
const admin = require('firebase-admin');
const { serviceAccount } = require('../keys/development.keys');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});




async function sendNotificationsToAllDrivers(bookingData) {
 
  const driverData = await driver.find({ device_token: { $ne: null } , status: "ACTIVE" });
  
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

  for (const token of driverTokens) {
    message.token = token;

    // Send the message to the driver's device
    try {
      const response = await admin.messaging().send(message);
      console.log(`Notification sent to ${token} successfully:`, response);
    } catch (error) {
      console.error(`Error sending notification to ${token}:`, error);
    }
  }
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