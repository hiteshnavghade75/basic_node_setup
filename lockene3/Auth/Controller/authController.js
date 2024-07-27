const { validationResult } = require("express-validator");
const cloudinary = require("../../Config/cloudinary.config");
const { encrypt, decrypt } = require('../../Encryption/cryptoUtils');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../Model/authModel");
const { createUser: saveUserToDB } = require("../Model/authModel");
const sendMail = require("../../Helpers/sendMail");
const multer = require("multer");

// const createUser = async (req, res) => {
//   const errors = validationResult(req);

//   if (!errors.isEmpty()) {
//     return res.status(400).json({ errors: errors.array() });
//   }

//   try {
//     const existingUser = await User.findUserByEmail(req.body.email);

//     if (existingUser) {
//       return res.status(409).json({
//         message: "User already exists",
//       });
//     }

//     await User.createUser(req.body);

//     const mailSubject = "Registration Successful!";
//     const content = `
//       <p>Hi ${req.body.full_name},</p>
//       <p>Your registration was successful.</p>
//     `;
//     sendMail(req.body.email, mailSubject, content);

//     return res.status(201).json({
//       message: "User has been registered",
//     });
//   } catch (err) {
//     console.error("Error creating user:", err.stack);
//     return res.status(500).json({
//       message: "Error creating user",
//       error: err.message,
//     });
//   }
// };

const storage = multer.memoryStorage();
const upload = multer({ storage });

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const createUser = async (req, res) => {
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { full_name, email, password, mobile_number } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "Profile picture is required" });
    }

    const existingUser = await User.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const result = await uploadToCloudinary(file.buffer);

    const hashedPassword = await bcrypt.hash(password, 10);
    const encryptedMobileNumber = encrypt(mobile_number);

    const userData = {
      full_name,
      email,
      password: hashedPassword,
      mobile_number : encryptedMobileNumber,
      profile_pic: result.secure_url,
    };

    saveUserToDB(userData, (err, dbResult) => {
      if (err) {
        return res.status(500).json({ message: "Database error", error: err });
      }

      const mailSubject = "Registration Successful!";
      const content = `
        <p>Hi ${full_name},</p>
        <p>Your registration was successful.</p>
      `;
      sendMail(email, mailSubject, content);

      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
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
         <p>Please <a href="http://localhost:8080/v1/user/reset-password?uid=${encodeURIComponent(
           uid
         )}&expires=${expiration}">Click Here</a> to reset your password. This link will expire in 10 minutes.</p>
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
  resetPassword,
  upload,
};
