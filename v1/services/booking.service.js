
const booking = require("../../models/booking.model")
const constants = require("../../config/constants")

exports.Bookingsave = data => new booking(data).save();

exports.getBooking = async (idOrEmail, fieldName = '_id') => {
    const data = await booking.findOne({
      [fieldName]: `${idOrEmail}`
    }).lean();
    
    return data;
  };
  