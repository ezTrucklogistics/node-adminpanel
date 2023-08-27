const NodeGeocoder = require('node-geocoder');
const axios = require('axios');
const {GOOGLE_APIKEY} = require("../keys/development.keys")

const options = {
  provider: 'mapquest',
  apiKey: 'pb9y7WZJycuk9Zi1prOzZhs7Kn5EOG6G', // for Mapquest, OpenCage, Google Premier
  formatter: null // 'gpx', 'string', ...
};

exports.geocoder = NodeGeocoder(options);


exports.generateOtp = () => {

      return Math.floor(100000 + Math.random() * 900000)
}


exports.getDistanceAndTime = async (origins , destinations)  => {

  const apiUrl = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
  origins
)}&destinations=${encodeURIComponent(destinations)}&key=${GOOGLE_APIKEY}`;

try {
  const response = await axios.get(apiUrl);
  const data = response.data;

  if (data.status === 'OK' && data.rows.length > 0 && data.rows[0].elements.length > 0) {
    const distance = data.rows[0].elements[0].distance.text;
    const duration = data.rows[0].elements[0].duration.text;
    return { distance, duration };
  } else {
    throw new Error('Error fetching distance and time.');
  }
} catch (error) {
  throw new Error('Error fetching data:', error);
 }
}


exports.isArrayofObjectsJSON = (arr) => {
  try {
    const jsonString = JSON.stringify(arr); // Convert array to JSON string
    JSON.parse(jsonString); // Attempt to parse the JSON string
    return true; // The array of objects is valid JSON
  } catch (error) {
    return console.log("It's not a valid type json")// The array of objects is not valid JSON
  }
}









