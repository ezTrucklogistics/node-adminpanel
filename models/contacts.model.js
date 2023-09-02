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
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
});


//Output data to JSON
contactSchema.methods.toJSON = function () {
    const address = this;
    const addressObject = address.toObject();
    return addressObject;
};


//Define user model
const Address = mongoose.model('contacts',  addressSchema);
module.exports = Address;