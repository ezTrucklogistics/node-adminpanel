const mongoose = require('mongoose');
const dateFormate = require('../helper/dateformat.helper');
const Schema = mongoose.Schema;



//Define user schema
const walletSchema = new Schema({

    driver: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'driver'
    },
    daily_earning: {
        type: Number,
        default:0
    },
    monthly_earning: {
        type: Number,
        default: 0
    },
    date: {
        type:String,
        default:dateFormate.set_current_timestamp()
    }
});


//Output data to JSON
walletSchema.methods.toJSON = function () {
    const wallet = this;
    const walletObject = wallet.toObject();
    return walletObject;
};




//Define user model
const wallet = mongoose.model('wallet',  walletSchema);
module.exports = wallet;