const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys');
const constants = require('../config/constants');
const Schema = mongoose.Schema;



//Define user schema
const userSchema = new Schema({

    mobile_number : {
        type:String,
        default:null
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    customer_name: {
        type: String,
        default: null
    },
    user_type: {
        type: Number, 
        default:constants.USER_TYPE.CUSTOMER //1-ADMIN 2-customer
    },
    status: {
        type: String,
        default: constants.STATUS.ACCOUNT_ACTIVE
    },
    termConditions:{
       type:Boolean,
       default:false
    },
    device_token: {
        type: String,
        default: null
    },
    device_type: {
        type: Number,
        default: null  // 'ANDROID' : 1,	'IOS' : 2,
    },
    refresh_tokens: {
        type: String,
        default:null
    },
    authTokens: {
        type: String,
        default:null
    },
    created_at: {
        type: String,
    },
    updated_at: {
        type: String,
    },
    deleted_at: {
        type: String,
        default: null,
    },
});

userSchema.index({
    "mobile_number": 1
});

//Output data to JSON
userSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    return userObject;
};

//Generating auth token
userSchema.methods.generateAuthToken = async function () {
    const user = this;
    const token = await jwt.sign({
        _id: user._id.toString()
    }, JWT_SECRET , { expiresIn: '24h' })
    user.tokens = token
    user.updated_at = await dateFormat.set_current_timestamp();
    user.refresh_tokens_expires = await dateFormat.add_time_current_date(1,'days')
    await user.save()
    return token
}

userSchema.methods.generateRefreshToken = async function () {
    const user = this;
    const refresh_tokens = await jwt.sign({
        _id: user._id.toString()
    }, JWT_SECRET)

    user.refresh_tokens = refresh_tokens
    user.updated_at = await dateFormat.set_current_timestamp();
    await user.save()
    return refresh_tokens
}


//Define user model
const User = mongoose.model('users', userSchema);
module.exports = User;