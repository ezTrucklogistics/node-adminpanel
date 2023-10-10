const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const dateFormate = require("../helper/dateformat.helper")



const driverWalletSchema = new Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "driver",
    required: true,
  },
  earning:[{
    type:Number
  }],
  created_at: {
     type:String,
     default:dateFormate.set_current_timestamp()
  }

});

driverWalletSchema.methods.toJSON = function () {
    const driverWallet = this;
    const driverWalletObject = driverWallet.toObject();
    return driverWalletObject;
};

//Define user model
const driverWallet = mongoose.model("driverWallet", driverWalletSchema);
module.exports = driverWallet;
