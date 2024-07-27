const db = require("../../Config/connection");
const bcrypt = require("bcryptjs");
const { encrypt, decrypt } = require('../../Encryption/cryptoUtils');

const queryAsync = (query, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, values, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

const findUserByEmail = async (email) => {
  const query = `SELECT * FROM users WHERE LOWER(email) = LOWER(?);`;
  const results = await queryAsync(query, [email]);
  if (results[0]) {
    try {
      results[0].mobile_number = decrypt(results[0].mobile_number);
    } catch (error) {
      console.error("Decryption failed:", error.message);
      results[0].mobile_number = "Decryption error";
    }
  }
  return results[0];
};

// const createUser = async (user) => {
//   try {
//     const hashedPassword = await bcrypt.hash(user.password, 10);
//     const encryptedMobileNumber = encrypt(user.mobile_number);
    
//     const query = `INSERT INTO users (full_name, email, password, mobile_number) VALUES (?, ?, ?, ?);`;
//     const values = [user.full_name, user.email, hashedPassword, encryptedMobileNumber];
    
//     const result = await queryAsync(query, values);
    
//     return result;
//   } catch (err) {
//     console.error("Error creating user:", err.message);
//     throw new Error("Error creating user: " + err.message);
//   }
// };

const createUser = (userData, callback) => {
  const query = 'INSERT INTO users (full_name, email, password, mobile_number, profile_pic) VALUES (?, ?, ?, ?, ?)';
  db.query(query, [userData.full_name, userData.email, userData.password, userData.mobile_number, userData.profile_pic], callback);
};

const decryptUserData = (users) => {
  return users.map(user => {
    try {
      user.mobile_number = decrypt(user.mobile_number);
    } catch (err) {
      console.error(`Failed to decrypt mobile number for user ${user.email}:`, err.message);
      user.mobile_number = "Decryption error";
    }
    return user;
  });
};

const getAllUsers = async () => {
  try {
    const query = `SELECT * FROM users`;
    const results = await queryAsync(query);

    return decryptUserData(results);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    throw new Error("Error fetching users: " + err.message);
  }
};

const updateUserPassword = async (email, hashedPassword) => {
  try {
    const query = `UPDATE users SET password = ? WHERE email = ?;`;
    const values = [hashedPassword, email];
    
    const result = await queryAsync(query, values);
    
    return result;
  } catch (err) {
    console.error("Error updating user password:", err.message);
    throw new Error("Error updating user password: " + err.message);
  }
};

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers,
  updateUserPassword
};



