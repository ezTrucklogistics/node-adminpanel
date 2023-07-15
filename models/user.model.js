const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dateFormat = require('../helper/dateformat.helper');


const {
    JWT_SECRET
} = require('../keys/keys');
const constants = require('../config/constants');

var Schema = mongoose.Schema;


//Define user schema
var userSchema = new Schema({
    
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    customer_Id :{
        type:Number,
        default:null
    },
    customer_name: {
        type: String,
        default: null
    },
    mobile_number : {
        type:String,
        default:null
    },
    user_type: {
        type: Number, //1-admin 2-user
        default: 2
    },
    status: {
        type: String,
        default: constants.STATUS.DE_ACTIVE
    },
    device_token: {
        type: String,
        default: null
    },
    device_type: {
        type: Number,
        default: null  // 'ANDROID' : 1,	'IOS' : 2,
    },
    OTP:{
        type:Number,
        default:null
    },
    refresh_tokens: {
        type: String,
        default:null
    },
    profile_img:{
        type:String,
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
    "email": 1
});

//Checking if password is valid
userSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

//Output data to JSON
userSchema.methods.toJSON = function () {
    var user = this;
    var userObject = user.toObject();
    return userObject;
};

//Checking for user credentials
userSchema.statics.findByCredentials = async function (email, password, user_type) {

    const user = await User.findOne({
        $or:[{email: email},{user_name: email}],
        user_type: user_type,
        deleted_at: null
    });

    if (!user) {
        return 1
    }

    if (!user.validPassword(password)) {
        return 2
    }

    return user;
}

//Generating auth token
userSchema.methods.generateAuthToken = async function () {
    var user = this;
    var token = await jwt.sign({
        _id: user._id.toString()
    }, JWT_SECRET , { expiresIn: '24h' })
    user.tokens = token
    user.updated_at = await dateFormat.set_current_timestamp();
    user.refresh_tokens_expires = await dateFormat.add_time_current_date(1,'days')
    await user.save()
    return token
}

userSchema.methods.generateRefreshToken = async function () {
    var user = this;
    var refresh_tokens = await jwt.sign({
        _id: user._id.toString()
    }, JWT_SECRET)

    user.refresh_tokens = refresh_tokens
    user.updated_at = await dateFormat.set_current_timestamp();
    await user.save()
    return refresh_tokens
}


//Define user model
var User = mongoose.model('users', userSchema);
module.exports = User;