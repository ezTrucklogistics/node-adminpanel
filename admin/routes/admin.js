const express = require('express');
const router = express.Router();
const adminAuthenticate = require('../../middleware/admin.middleware')
const {
  login,
  logout,
  signUp
} = require('../controllers/admin.controller')


router.post('/signup' , signUp)
router.post('/login',  login)
router.get('/logout', adminAuthenticate, logout)



module.exports = router;


