const express = require("express");
const router = express.Router();
const { authValidation, forgetValidation } = require('../../Helpers/authValidation')
const userController = require("../Controller/userController");

router.post("/register", authValidation, userController.createUser);
router.post("/login", authValidation, userController.loginUser);
router.post("/forget-password", forgetValidation, userController.forgetPassword );
router.post("/reset-password", forgetValidation, userController.resetPassword);

module.exports = router;