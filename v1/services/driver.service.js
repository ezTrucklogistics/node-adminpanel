

const driver = require("../../models/driver.model");


exports.Driversave = data => new driver(data).save();