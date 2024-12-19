const express = require('express');
const router = express.Router();
const asyncHandler = require("../../utils/asyncHandler")
// Controllers
const auth = require("../../controllers/user");

// Middlewares
const { isAuthenticated, isUser  } = require('../../middleware/AuthMiddleware');

const onlyUserAccess = [isAuthenticated, isUser];

// Auth
router.route("/sign-up").post(asyncHandler(auth.signUp));
router.route("/login").post(asyncHandler(auth.login));

router.route('/get-credentials').get(onlyUserAccess, asyncHandler(auth.getCredentials));
router.route('/forget-password').post(asyncHandler(auth.forgetPassword));
router.route('/set-password').put(onlyUserAccess, asyncHandler(auth.setPassword));

module.exports = router;