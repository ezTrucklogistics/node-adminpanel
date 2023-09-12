const driver = require('../models/driver.model');
const admin = require('firebase-admin');
const { serviceAccount } = require('../keys/development.keys');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});


// Function to find drivers within a given radius from customerLocation
async function findDriversWithinRadius(customerLocation, radius) {
  try {
    const driverData = await driver.find()
    const driversWithinRadius = driverData.filter((driver) => {
      const driverDistance = calculateDistance(
        customerLocation.latitude,
        customerLocation.longitude,
        driver.driver_lat,
        driver.driver_long
      );

      return driverDistance <= radius;
    });

    return driversWithinRadius;
  } catch (error) {
    console.error('Error finding drivers within radius:', error);
    return [];
  }
}

// Calculate the distance between two sets of latitude and longitude coordinates
function calculateDistance(lat1, lon1, lat2, lon2) {
  console.log(lat1 , lon1 , lat2 , lon2)
  const earthRadiusKm = 6371;
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = earthRadiusKm * c;
  console.log(distance)
  return distance;
}

// Convert degrees to radians
function deg2rad(deg) {
  return deg * (Math.PI / 180);

}


async function sendNotificationsToAllDrivers(customerLocation , bookingData) {
  const maxRadius = 30; // Maximum search radius in kilometers
  let searchRadius = 10; // Initial search radius in kilometers

  while (searchRadius <= maxRadius) {
    const drivers = await findDriversWithinRadius(customerLocation, searchRadius);

    if (drivers.length > 0) {
      const driverTokens = drivers.map((driverData) => driverData.device_token);

      const message = {
        data: {
          title: 'New Booking',
          body: 'New Booking request to drivers within ' + searchRadius + ' km',
          bookingData: JSON.stringify(bookingData), // Replace with your booking data
        },
      };

      // Send the message to each driver's device token
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

      // Exit the loop since drivers were found
      break;
    } else {
      // If no drivers found within the current search radius, increase the radius by 5 km
      searchRadius += 5;
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