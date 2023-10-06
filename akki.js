const cron = require('node-cron');
const driver = require('./models/driver.model'); // Import your driver model

// Define the cron job to run every 2 seconds
const  data = async () => {
  try {
    // Fetch all drivers from the database
    const drivers = await driver.find();
    console.log(drivers)


    console.log('Driver earnings updated.');
  } catch (error) {
    console.error('Error updating driver earnings:', error);
  }

};


data()