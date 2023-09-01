const driver = require('../models/driver.model');
// const FCM = require("fcm-node");
// const { SERVICE_KEY } = require("../keys/development.keys");
// const fcm = new FCM(SERVICE_KEY);


const admin = require('firebase-admin');
const serviceAccount = {
  "type": "service_account",
  "project_id": "flutter-driver-app-db0db",
  "private_key_id": "528ccb27df131a8c16e4a6459cce948f5676ad6c",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCjuki5jiOvp5fT\niwHfegfrTscbUaNVAAgnvFpeTlF5WbZjwVA0jiGc4PVjT507rKUUv4lSQwUbYNuy\nXq9ibpN2jAyD/2Gy2Hn9XnORAs6lLQ3WjaxgdEv2A/hk2Wd68huM0A/sj1OueH3h\nypEC784vjJO4HJvSyLYKWxX8QWXW/y6sR+JVoC5t63R/yCDm0l2pQGOJjOUPijJE\nhM2mntKJmKxUxBLlxH/uxyEoXTlJQ+fvgUb4Efno3G2iK0Mjd7tihYhh/SJP6MzP\nDGxZJVXXa4NWfYU5gmtDxUX1tbvJKahbWexohnwCLu9yswlH/7HSufFKHUARf41f\nTeoen4+tAgMBAAECggEAQaQ28gXVst/rVAnAN3uyXxnXY9GIPVTk8CFozbRyn8dj\nA32GjXuKaF4co7NQo5MlIDtmb8+k5YQgsNObV0hj4LxnbChgYBbAWd+bT8EjXj/A\n84sbWBRoO/r9hFlRTo5wkzT7nWkdMK7oMTVIjDfen1uqAb+ejZSgv2gjWV5S2S4T\nNU3hG4Xem/gjn6nNdLtF038YkA7BpT8WhrvXiPRYhfJbiWeD+OdqaiqhegKp+tz8\nlEuCzyqmdIqhW8PGDfjGU2MyvpA1ccA27Lys/uL377C5MJzBtnYl63Fs28JvGkU6\nK8145Hv5QStzLTiByAMkMgOW09X0lsbqL0cJpHS5NQKBgQDdxUsvB3A9ucrFzDpG\nAn37nZJVlWR7ABH3p3mnRFpHo5pJZORD5Nx7Xy6HAMbYmUFbyGru20N8L/cGzm8U\nwtml6Sn0yr5Fugva+XIBV/T5osBZV4iwJRXCODzM3T0fPd46J+U+nKX37VKjjoAf\n2dcA17eTJwnZmkZhkSSK7VzedwKBgQC8/5FvQXQIk2ctgAJLL4oNY9sRKt88m9xP\n89xZ6EkHjH6mUpdB/03+6ft/hT8ZXObQdXW85ffLuUF5lqUBC5TVtDDy/OLUCAa8\nadaxANulSEZpa5UuX4kOyVhH3KVI84Dvbubj9+1ILfOvrvc0wkgZ34uoyNZYiSLP\nojpQ3YFX+wKBgGfKfnV0NcOtwIjyHBPH9s5b4LDNSkmGruIJL5ZpFxeQKhVPcsWT\nxty2nz/vzSByGXSrR+CiHeNxT1uQIczFpLdReKFogcSAXiwNsp2OXMi4su0dWouV\nz6kmSM5YfNKyUd9F7LRw+/wcxiBmAPDnMwjh7Lih/Koq2eWv2Dps/JnhAoGATR0p\nxe863NTn4FS+mtbGyTfZBmQruZsOhUDGw5hXU9ErS8mfFbqJpFzr1NgVKtARDTUf\n2Pcr59+qq2Wf5ZFIJPnkjwBHvKOZu/6jLo1fEU0wDYtrzwQD9BiLAKcyeVWBYjAp\n3RInqq+1IhWNn+U1bfkcDr4DVxR9M6LJkH0QbUkCgYEA0fYmmr/Y7nN4RMVMNINs\nsdSQhRJkqv+OdCyiZrFYEMqpyZcLxIaegATOFKYwtGAEWMm5qkywkCHJyDBOYcNy\nlckzZzafPochE0OVkRZEj3sCi2bpbfl9q3ZlKKODTn4j7a1d5J27oBs1ha4xUMGg\nO0NwFzYPwnnYuRVD2BujuP4=\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-jksdj@flutter-driver-app-db0db.iam.gserviceaccount.com",
  "client_id": "115536667596740325379",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-jksdj%40flutter-driver-app-db0db.iam.gserviceaccount.com",
  "universe_domain": "googleapis.com"
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

async function sendNotificationsToAllDrivers(bookingData) {

    const drivers = await driver.find();
    const driverTokens = drivers.map((driverdata)=> driverdata.device_token)
    console.log(driverTokens)

      const message = {
        data: {
            title: 'New Booking',
            body: 'New Booking request to all drivers',
            bookingData: JSON.stringify(bookingData),
        },
     };
     
     // Send the message to each device token
     driverTokens.forEach((token) => {
        message.token = token;
     
        // Send the message to the device
        admin.messaging().send(message)
            .then((response) => {
                console.log(`Notification sent to ${token} successfully:`, response);
            })
            .catch((error) => {
                console.error(`Error sending notification to ${token}:`, error);
            });
     });
 
  }


  async function sendFCMNotificationToCustomer(registrationToken, driverData) {

      const message = {

        data: {
            title: 'Booking accepted',
            body: 'Booking confirmation by driver',
            driverData: JSON.stringify(driverData),
        },
        token: registrationToken
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