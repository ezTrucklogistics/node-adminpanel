const mongoose = require('mongoose');
var Schema = mongoose.Schema;

var versionSchema = new mongoose.Schema({
    version_number: {
        type: String,
        default: null,
        trim: true,
    },
    device_type: {
        type: Number,
        default: null  // 'ANDROID' : 1,	'IOS' : 2,
    },
    is_force_update: {
        type: Number,
        default: null,
        trim: true,
    },
    created_at: {
        type: Number,
    },
    updated_at: {
        type: Number,
    },
    syncAt:{
        type: Number,
    },
    deleted_at:{
        type: Number,
        default:null
    }
});

const version = mongoose.model('version', versionSchema);
module.exports = version;