// Sample driver data (replace with your actual driver data)
const drivers = [
    { id: '1', latitude: 52.5300, longitude: 13.4050, isAvailable: true, deviceToken: 'driver1-token' },
    { id: '2', latitude: 52.5250, longitude: 13.4055, isAvailable: true, deviceToken: 'driver2-token' },
    { id: '3', latitude: 52.5305, longitude: 13.4060, isAvailable: true, deviceToken: 'driver3-token' },
    // Add more driver data as needed
  ];
  let serverKey = "AAAAXaN35Ss:APA91bGHihxZ4wDVO2J-yZiXkEOGn0ymytR6STB7zaxM-pfn50CaBWUQI9llthgCZn2ab98CzGln7zEl-38WtztISHvXmsrxAWUBqlnRB3Fqy4X4GrmA64tXCijlhaA2bCLx6PbtsJUj"
  const FCM = require('fcm-node')
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
  
  async function sendFCMNotificationToDriver(driverToken, bookingDetails) {
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
      try {
        fcm.send(message, function (err, response) {
          if (err) {
            console.error(`Error sending notification to driver: ${err}`);
          } else {
            console.log(`Notification sent to driver.`);
          }
        });
      } catch (error) {
        console.error(`Error sending notification to driver: ${error}`);
      }
  }
  
  function findDriversWithinRadius(pickupLat, pickupLon, radius) {
    const driversWithinRadius = drivers.filter((driver) => {
      const distance = calculateDistance(pickupLat, pickupLon, driver.latitude, driver.longitude);
      return driver.isAvailable && distance <= radius;
    });
  
    return driversWithinRadius;
  }
  
  async function sendNotificationsToDrivers(pickupLat, pickupLon, radius) {
    const driversWithinRadius = findDriversWithinRadius(pickupLat, pickupLon, radius);
  
    if (driversWithinRadius.length === 0) {
      // No drivers found within the current radius, increase the radius by 5 km
      const expandedRadius = radius + 5;
  
      if (expandedRadius <= 15) {
        console.log(`No drivers found within ${radius} km radius. Expanding to ${expandedRadius} km.`);
        await sendNotificationsToDrivers(pickupLat, pickupLon, expandedRadius);
      } else {
        console.log(`No drivers found within the maximum radius of 15 km.`);
        // Handle the case where no drivers are found even within the maximum radius.
      }
    } else {
      console.log(`Found drivers within ${radius} km radius, sending notifications.`);
  
      // Send notifications to each driver found
      for (const driver of driversWithinRadius) {
        const driverToken = driver.deviceToken;
        const bookingDetails = {
          customerId: '123', // Replace with actual customer ID
          // Add other booking details as needed
        };
  
        await sendFCMNotificationToDriver(driverToken, bookingDetails);
      }
    }
  }
  
  // Example usage:
  const pickupLat = 52.5200; // Customer pickup location latitude
  const pickupLon = 13.4050; // Customer pickup location longitude
  const initialRadius = 10; // Initial search radius in kilometers
  
  sendNotificationsToDrivers(pickupLat, pickupLon, initialRadius)
    .then(() => {
      // Handle success
    })
    .catch((error) => {
      console.error('Error sending notifications:', error);
    });
  