const express = require("express");
const router = express.Router();
const { lockene_user_validation, forgetValidation } = require('../../Helpers/lockeneUserAuthValidation')
const userController = require("../Controller/userController");

router.post("/register", lockene_user_validation, userController.createUser);
router.post("/login", lockene_user_validation, userController.loginUser);
router.post("/forget-password", forgetValidation, userController.forgetPassword );
router.post("/reset-password", forgetValidation, userController.resetPassword);

module.exports = router;