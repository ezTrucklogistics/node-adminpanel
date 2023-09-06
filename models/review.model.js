const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dateFormate = require("../helper/dateformat.helper")


const reviewSchema = new Schema({
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
  rating: {type:String},
  comment: String,
  date: {
     type:String,
     default:dateFormate.set_current_timestamp()
  }

});

reviewSchema.methods.toJSON = function () {
    const review = this;
    const reviewObject = review.toObject();
    return reviewObject;
};

//Define user model
const review = mongoose.model("review", reviewSchema);
module.exports = review;
