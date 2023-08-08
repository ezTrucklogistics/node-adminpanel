// const ADMIN = require('firebase-admin');
// var serviceAccount = require('./firebaseConfig.json');
// const _ = require('lodash');

// const Notification = require('../models/notification.model');
// const keys = require('../keys/keys');
// // const config = require('../config/config');
// const constants = require('../config/constants');
// const dateFormat = require('./dateformat.helper');
// const moment = require('moment');
// const Tags = require('../models/tags.model')

// ADMIN.initializeApp({
//   credential: ADMIN.credential.cert(serviceAccount),
//   databaseURL: keys.FIREBASE_DATABASE_URL,
// });


// exports.subscribeUserToTopic = async ({deviceType, deviceToken, userData}) => {
//   try {
//       if (!deviceType || !deviceToken) {
//           console.log('Invalid deviceType or deviceToken in subscribeUserToTopic()=> ', userData);
//           return;
//       }

//       let topicName = '';
//        if (deviceType == constants.DEVICE_TYPE.ANDROID) {
//           topicName = constants.ANDROID_USERS_TOPIC;
//        } else if (deviceType == constants.DEVICE_TYPE.IOS) {
//           topicName = constants.IOS_USERS_TOPIC;
//        }  

//        if (topicName !== '') {
//           ADMIN.messaging().subscribeToTopic([deviceToken], topicName)
//               .then(function(response) {
//                       console.log('Successfully subscribed to topic:', response);
//               })
//               .catch(function(error) {
//                   console.log('Error subscribing to topic: %j', error);
//               });
//       }

//        return true;
//   } catch (error) {
//       console.log('error in subscribeUserToTopic()=> ',error);
//   }
// }

// exports.unsubscribeUserFromTopic = async ({deviceType, deviceToken, userData}) => {
//   try {
//       if (!deviceType || !deviceToken) {
//           console.log('Invalid deviceType or deviceToken in unsubscribeUserFromTopic()=> ', userData);
//           return;
//       }

//       let topicName = '';
//        if (deviceType == constants.DEVICE_TYPE.ANDROID) {
//           topicName = constants.ANDROID_USERS_TOPIC;
//        } else if (deviceType == constants.DEVICE_TYPE.IOS) {
//           topicName = constants.IOS_USERS_TOPIC;
//        }

//        if (topicName !== '') {
//           ADMIN.messaging().unsubscribeFromTopic([deviceToken], topicName)
//               .then(function(response) {
//                   console.log('Successfully unsubscribed from topic:', response);
//               })
//               .catch(function(error) {
//                   console.log('Error unsubscribing from topic: %j', error);
//               });
//        }

//        return true;
//   } catch (error) {
//       console.log('error in unsubscribeUserFromTopic()=> ',error);
//   }
// }