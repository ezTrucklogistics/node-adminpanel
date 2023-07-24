const FCM = require('fcm-notification');
const { FIRE_BASE_SERVICE_KEY } = require("../keys/development.keys")
const fcm = new FCM(FIRE_BASE_SERVICE_KEY);
const driver = require("../models/driver.model")


// Define a function to send push notifications
async function sendPushNotification() {

    const drivers = await driver.find();
    const deviceTokens = drivers.map((driver) => driver.device_token);

  const message = {
    notification: {
      title:'Booking Notification',
      body:'Your Booking sucessfully created'
    },
  };

  try {
    const result = await fcm.sendToDevice(deviceTokens, message);
    console.log('Successfully sent push notification:', result);
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
}


 exports.sendPushNotification = sendPushNotification();
