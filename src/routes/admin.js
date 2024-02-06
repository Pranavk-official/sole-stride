const express = require('express');
const router = express.Router();

const adminController = require('../controller/adminController')

/* GET home page. */
router.get('/', adminController.getDashboard);

module.exports = router;