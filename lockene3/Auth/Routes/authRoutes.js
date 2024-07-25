const express = require("express");
const router = express.Router();
const { authValidation, forgetValidation } = require('../../Helpers/authValidation')
const authController = require("../Controller/authController");

router.post("/", authValidation, authController.createUser);
router.post("/login", authValidation, authController.loginUser);
router.post("/forget-password", forgetValidation, authController.forgetPassword );
router.post("/reset-password", forgetValidation, authController.resetPassword);

module.exports = router;