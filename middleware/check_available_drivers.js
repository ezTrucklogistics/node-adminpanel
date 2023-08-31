const driver = require('../models/driver.model');
const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys");
const fcm = new FCM(SERVICE_KEY);




exports.sendFCMNotificationToDriver = async (bookingDetails) => {
  
  try {
   
    // const drivers = await driver.find({}, 'device_token'); // Assuming 'device_token' is the field that stores registration tokens

    // if (drivers.length === 0) {
    //   console.log("No drivers found.");
    //   return;
    // }

    // // Extract driver tokens into an array
    // const driverTokens = drivers.map((driverData) => driverData.device_token);

    const driverTokens = [
      "dAS0FSg1Q2SAQG-V1DE7th:APA91bHpjjRbxRw9UIdKLkupn7hDET8yKEEO2zK1qHpLVCfcdSPCKSPLSh5b766-xjgnqAYB6w688yI5BnGYSFcO1H63jKu_ayBqSWcgd6RJngOs9wk7f0_9Ix6V8ieu-uxy0tHoQl1T"
    ];

    const message = {
      registration_ids: driverTokens, // Send to all driver tokens
      notification: {
        title: 'New Booking Request',
        body: 'You have a new booking request.',
      },
      data: {
        customData:bookingDetails
      },
      collapse_key:""
    };

    console.log(message.data)
    // Send the notification to all drivers
    fcm.send(message, function (err, response) {
      if (err) {
        console.error(`Error sending notification to drivers: ${err}`);
      } else {
        console.log(`Notification sent to drivers.`);
      }
    });
  } catch (error) {
    console.error(`Error sending notification to drivers: ${error}`);
  }
}





exports.sendFCMNotificationToCustomer = async (customerToken, driverData) => {
  // Construct the notification message for the customer
  const message = {
    to: customerToken,
    notification: {
      title: 'Booking Accepted',
      body: 'Your booking request has been accepted by the driver.',
    },
    data: {
      // Include driver data here
      ...driverData,
    },
  };

  // Send the notification to the customer
  try {
    fcm.send(message, function (err, response) {
      if (err) {
        console.error(`Error sending notification to customer: ${err}`);
      } else {
        console.log(`Notification sent to customer.`);
      }
    });
  } catch (error) {
    console.error(`Error sending notification to customer: ${error}`);
  }
}


