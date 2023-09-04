const mongoose = require('mongoose');
const Schema = mongoose.Schema;


//Define user schema
const addressSchema = new Schema({

    User: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'users'
    },
    street: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        type: String,
      },
      pinCode: {
        type: String,
      },
      country: {
        type: String,
      },
});


//Output data to JSON
addressSchema.methods.toJSON = function () {
    const address = this;
    const addressObject = address.toObject();
    return addressObject;
};


//Define user model
const Address = mongoose.model('contacts',  addressSchema);
module.exports = Address;