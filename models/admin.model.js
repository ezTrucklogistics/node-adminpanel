const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const dateFormat = require('../helper/dateformat.helper');
const {
    JWT_SECRET
} = require('../keys/keys');
const constants = require('../config/constants');
const Schema = mongoose.Schema;



//Define admin schema
const adminSchema = new Schema({

    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    full_name: {
        type: String,
        default: null
    },
    password: {
        type: String,
        default: null
    },
    user_type: {
        type: Number, 
        default: constants.USER_TYPE.ADMIN //1-ADMIN 2-customer
    },
    status: {
        type: String,
        default: constants.STATUS.ACCOUNT_ACTIVE
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

adminSchema.index({
    "email": 1
});

//Output data to JSON
adminSchema.methods.toJSON = function () {
    const admin = this;
    const adminObject = admin.toObject();
    return adminObject;
};

//Checking if password is valid
adminSchema.methods.validPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};


//Checking for admin credentials
adminSchema.statics.findByCredentials = async function (email, password, admin_type) {

    const admin = await admin.findOne({
        $or:[{email: email},{admin_name: email}],
        admin_type: admin_type,
        deleted_at: null
    });

    if (!admin) {
        return 1
    }

    if (!admin.validPassword(password)) {
        return 2
    }

    return admin;
}


//Generating auth token
adminSchema.methods.generateAuthToken = async function () {
    const admin = this;
    const token = await jwt.sign({
        _id: admin._id.toString()
    }, JWT_SECRET , { expiresIn: '24h' })
    admin.tokens = token
    admin.updated_at = await dateFormat.set_current_timestamp();
    admin.refresh_tokens_expires = await dateFormat.add_time_current_date(1,'days')
    await admin.save()
    return token
}

adminSchema.methods.generateRefreshToken = async function () {
    const admin = this;
    const refresh_tokens = await jwt.sign({
        _id: admin._id.toString()
    }, JWT_SECRET)

    admin.refresh_tokens = refresh_tokens
    admin.updated_at = await dateFormat.set_current_timestamp();
    await admin.save()
    return refresh_tokens
}

//Define admin model
const admin = mongoose.model('admins', adminSchema);
module.exports = admin;