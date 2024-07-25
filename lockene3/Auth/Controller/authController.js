const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/authModel");
const sendMail = require("../../Helpers/sendMail");

const createUser = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const existingUser = await User.findUserByEmail(req.body.email);

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    await User.createUser(req.body);

    const mailSubject = "Registration Successfull!";
    const content = `
      <p>Hi ${req.body.full_name},</p>
      <p>Your registration was successful.</p>
    `;
    sendMail(req.body.email, mailSubject, content);

    return res.status(201).json({
      message: "User has been registered",
    });
  } catch (err) {
    console.error("Error creating user:", err.stack);
    return res.status(500).json({
      message: "Error creating user",
      error: err.message,
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(200).json({ token });
  } catch (err) {
    console.error("Error logging in user:", err.stack);
    return res.status(500).json({
      message: "Error logging in user",
      error: err.message,
    });
  }
};

const forgetPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await User.findUserByEmail(req.body.email);

    if (!user) {
      return res.status(401).json({ message: "Email doesn't exist" });
    }

    const uid = await bcrypt.hash(user.id.toString(), 10);
    const expiration = Date.now() + 10 * 60 * 1000;

    const mailSubject = "Forget Password";
    const content = `
        <p>Hi ${user.full_name},</p>
         <p>Please <a href="http://localhost:8080/reset-password?uid=${encodeURIComponent(uid)}&expires=${expiration}">Click Here</a> to reset your password. This link will expire in 10 minutes.</p>
      `;

    sendMail(req.body.email, mailSubject, content);

    return res.status(200).json({
      message: "Mail sent successfully for password reset",
    });
  } catch (err) {
    console.error("Error processing forget password request:", err.stack);
    return res.status(500).json({
      message: "Error processing forget password request",
      error: err.message,
    });
  }
};

const resetPassword = async (req, res) => {
    const { uid, expires } = req.query;
    const { newPassword } = req.body;
  
    if (Date.now() > expires) {
      return res.status(400).json({ message: "Link has expired" });
    }
  
    try {
      const users = await User.getAllUsers();
      let user;
      for (const u of users) {
        if (await bcrypt.compare(u.id.toString(), uid)) {
          user = u;
          break;
        }
      }
  
      if (!user) {
        return res.status(400).json({ message: "Invalid link" });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
  
      await User.updateUserPassword(user.email, hashedPassword);
  
      return res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      console.error("Error resetting password:", err.stack);
      return res.status(500).json({
        message: "Error resetting password",
        error: err.message,
      });
    }
  };
  

module.exports = {
  createUser,
  loginUser,
  forgetPassword,
  resetPassword
};
