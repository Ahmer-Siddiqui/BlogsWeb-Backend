const express = require('express');
const router = express.Router();

// Main Modules
router.use('/admin', require("./admin"));
router.use('/user', require("./user"));


module.exports = router;