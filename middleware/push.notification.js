const FCM = require("fcm-node");
const { SERVICE_KEY } = require("../keys/development.keys")
const fcm = new FCM(SERVICE_KEY);
const driver = require("./models/driver"); // Replace with the correct path to your Driver model
const booking = require("../models/booking.model");
const User = require("../models/user.model");



// Function to send notification to active drivers
exports.sendNotificationToActiveDrivers = async () => {

  try {

    
    // Find active drivers from the database
    const activeDrivers = await driver.find({ status: "ACTIVE" });

    // Extract deviceTokens from active drivers
    const driverDeviceTokens = activeDrivers.map(
      (driver) => driver.device_token
    );

    const notificationData = {
      title: "New Booking Request",
      body: "You have a new booking request. Accept or decline?",
      bookingId: "BOOKING_ID", // Include bookingId to identify the booking request
    };

    const message = {
      registration_ids: driverDeviceTokens,
      data: notificationData, // Include additional data here, e.g., bookingId
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.error("Error sending notification:", err);
      } else {
        console.log("Notification sent successfully:", response);
      }
    });
  } catch (err) {
    console.error("Error finding active drivers:", err);
  }
};

exports.sendNotificationToDrivers = async () => {

  try {
    // Find active drivers from the database
    const activeDrivers = await driver.find();

    // Extract deviceTokens from active drivers
    const driverDeviceTokens = activeDrivers.map(
      (driver) => driver.device_token
    );

    // Example usage:
    const notification_msg = {
      title: "EZTRUCK LOGISTIC SERVICE",
      body: "Good Morning Sir, we hope you're having a great day! Just a friendly reminder that our logistics team is here to assist you with any inquiries about your shipments. If you have any questions or need assistance, feel free to reach out to our customer support. Have a wonderful day ahead!",
    };
    const message = {
      registration_ids: driverDeviceTokens,
      data: notification_msg, // Include additional data here, e.g., bookingId
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.error("Error sending notification:", err);
      } else {
        console.log(
          "Notification sent successfully all the drivers :",
          response
        );
      }
    });
  } catch (err) {
    console.error("Error find in drivers notifications:", err);
  }
};


exports.sendNotificationToCustomers = async () => {
  try {
    // Find active drivers from the database
    const customer = await User.find();

    // Extract deviceTokens from active drivers
    const customerDeviceTokens = customer.map(
      (customer) => customer.device_token
    );

    // Example usage:
    const notification_msg = {
      title: "EZTRUCK LOGISTIC SERVICE",
      body: "Good Morning Sir, we hope you're having a great day! Just a friendly reminder that our logistics team is here to assist you with any inquiries about your shipments. If you have any questions or need assistance, feel free to reach out to our customer support. Have a wonderful day ahead!",
    };
    const message = {
      registration_ids: customerDeviceTokens,
      data: notification_msg, // Include additional data here, e.g., bookingId
    };

    fcm.send(message, function (err, response) {
      if (err) {
        console.error("Error sending notification:", err);
      } else {
        console.log(
          "Notification sent successfully all the customer",
          response
        );
      }
    });
  } catch (err) {
    console.error("Error find in drivers notifications:", err);
  }
};


exports.findAcceptedDriversByBookingId = async (driverId, bookingId) => {

  try {
    let driverdata = await driver.find({ driverId });
    const acceptedDrivers = await booking.find({ bookingId });
    acceptedDrivers.driverId = driverdata._id;
    await acceptedDrivers.save();
    return acceptedDrivers;
  } catch (err) {
    console.error("Error finding accepted drivers:", err);
    return [];
  }
};


// Schedule the cron job to run every day at 10:00 AM send notification driver and customer
cron.schedule("0 10 * * *", () => {

      sendNotificationToCustomers();
      sendNotificationToDrivers()
});
