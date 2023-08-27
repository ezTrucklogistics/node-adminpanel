
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