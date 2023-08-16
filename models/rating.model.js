const mongoose = require("mongoose");
const Schema = mongoose.Schema;


const ratingSchema = new Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
    required: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true,
  },
  rating_number: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  desc: {
    type: String,
  },
  created_at: {
    type: String,
  },

});

//Define user model
const Rating = mongoose.model("rating", ratingSchema);
module.exports = Rating;
