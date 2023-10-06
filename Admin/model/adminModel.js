const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    fullName: {
        type: String,
        required: true
    },
    role: {
        type: String,
        required: true,
        default: 'Admin',
    },
    profileImage: {
        type: String,
        default: 'default.jpg' 
    },
   
    isVerified: {
        type: Boolean,
        default: false
    },
   
});

const Admin = mongoose.model('Admin', adminSchema);

module.exports = Admin;

