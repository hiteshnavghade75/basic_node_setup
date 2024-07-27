const express = require("express");
const router = express.Router();
const { authValidation, forgetValidation } = require('../../Helpers/authValidation')
const authController = require("../Controller/authController");
const { createUser, upload } = require('../Controller/authController');

router.post("/register", upload.single('profile_pic'), createUser);
router.post("/login", authValidation, authController.loginUser);
router.post("/forget-password", forgetValidation, authController.forgetPassword );
router.post("/reset-password", forgetValidation, authController.resetPassword);

module.exports = router;