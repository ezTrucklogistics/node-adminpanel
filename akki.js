<<<<<<< HEAD

  let serverKey = "AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj"
  const FCM = require('fcm-node')
  const fcm = new FCM(serverKey);
 

  async function sendFCMNotificationToCustomer(customerToken, driverData) {
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
    console.log(message.data)
=======
// Sample driver data (replace with your actual driver data)
const drivers = [
    { id: '1', latitude: 20.31009, longitude: 85.82009, isAvailable: true, deviceToken: 'ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt' },
    // Add more driver data as needed
  ];
  
  const FCM = require('fcm-node');
  const serverKey = 'AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj'; // Replace with your actual FCM server key
  const fcm = new FCM(serverKey);

  
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const earthRadius = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return earthRadius * c;
  }
  
  function sendFCMNotificationToDriver(driverToken, bookingDetails) {
    // Construct the notification message
    const message = {
      to: driverToken,
      notification: {
        title: 'New Booking Request',
        body: 'You have a new booking request.',
      },
      data: {
        // Include booking details here
        ...bookingDetails,
      },
    };
  
    // Send the notification
    fcm.send(message, function (err, response) {
      if (err) {
        console.error(`Error sending notification to driver: ${err}`);
      } else {
        console.log(`Notification sent to driver.`);
      }
    });
  }
>>>>>>> 40d7b2aaac5aaa8babedc00a0025a5db58665699
  
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
  

<<<<<<< HEAD
  const driverData = {
    driverName: 'John Doe',
    driverLicense: 'ABC123',
    // Add other driver data as needed
  };
  
  const customerToken = 'ftmFi0IjT2KtO_bVmZ36Qp:APA91bG21yAVmLqB16ammyPwIjn8jfGYJmHVFwQgC6kXdMfH-az2W0yrUczRCL78KTIHkTCxkfLCUrYO_GoLlxRBQ1rambiAQQZmCBol4E8q-8VS7Ew3NakyxuUrLXaNkhw9S_N1Z4Bt'; // Replace with the customer's FCM token
  
  // Call the function to send the notification to the customer
 sendFCMNotificationToCustomer(customerToken, driverData).then(() => {
  console.log('Notification send successfully')
  })
  .catch((error) => {
   console.error('Error sending notifications:', error);
  });
=======


>>>>>>> 40d7b2aaac5aaa8babedc00a0025a5db58665699
