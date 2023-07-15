var express = require('express');
var router = express.Router();

const { verifyAccessToken } = require('../../middleware/admin.middleware')
const {create_version_validator,get_version_validator} = require('../../validation/version.validator');

const {
  createVersion,
  getAllVersionData,
  getAppVersion
} = require('../controllers/version.controller')

router.post('/createVersion', verifyAccessToken, create_version_validator, createVersion)
router.get('/getAllVersionData', verifyAccessToken, getAllVersionData)
router.get('/getAppVersion',verifyAccessToken, get_version_validator, getAppVersion)

module.exports = router;