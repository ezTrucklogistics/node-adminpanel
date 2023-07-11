var express = require('express');
const router = express.Router();

const {
    createEmailTemplate,
    updateEmailTemplate,
    getSingleEmailTemplate,
    getAllEmailTemplate,
    deleteEmailTemplate
} = require('../controllers/emailTemplate.controller');

const {emailTemplateValidator} = require('../../validation/emailTemplate.validator');
const { validatorFunc } = require('../../helper/commonFunction.helper');

// const auth = require('../../middleware/auth.middleware');
// const adminAccess = require('../../middleware/adminAccess.middleware');
// const adminSubAdminAccess = require('../../middleware/adminSubAdminAccess.middleware');

router.post('/createEmailTemplate', emailTemplateValidator, validatorFunc, createEmailTemplate);
router.put('/updateEmailTemplate/:id', emailTemplateValidator, validatorFunc, updateEmailTemplate);
router.get('/getSingleEmailTemplate/:id', getSingleEmailTemplate);
router.get('/getAllEmailTemplate/:lang', getAllEmailTemplate);
router.delete('/deleteEmailTemplate/:id', deleteEmailTemplate);

module.exports = router;