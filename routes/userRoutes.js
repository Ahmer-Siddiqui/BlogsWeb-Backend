const express = require('express');
const router = express.Router();
const asyncHandler = require("../utils/asyncHandler")
// Controllers
const auth = require("../controllers/user/userController");

// Auth
router.route("/login").post(asyncHandler(auth.login));

module.exports = router;