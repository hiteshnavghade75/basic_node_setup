// const db = require("../../Config/connection");
// const bcrypt = require("bcryptjs");

// const queryAsync = (query, values = []) => {
//   return new Promise((resolve, reject) => {
//     db.query(query, values, (err, results) => {
//       if (err) {
//         return reject(err);
//       }
//       resolve(results);
//     });
//   });
// };

// const findUserByEmail = async (email) => {
//   const query = `SELECT * FROM lockene_users WHERE LOWER(email) = LOWER(${db.escape(
//     email
//   )});`;
//   const results = await queryAsync(query);
//   return results[0];
// };

// const createUser = async (user) => {
//   const hashedPassword = await bcrypt.hash(user.password, 10);
//   const query = `INSERT INTO lockene_users (full_name, company_name, mobile_number, email, password, address, google_address, country, state, city, zipcode, team_size, industry_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
//   // id	full_name	company_name	mobile_number	email	password address	google_address	country	state	city	zipcode	team_size	industry_type	
//   const values = [
//     user.full_name,
//     user.company_name,
//     user.mobile_number,
//     user.email,
//     hashedPassword,
//     user.address,
//     user.google_address,
//     user.country,
//     user.state,
//     user.city,
//     user.zipcode,
//     user.team_size,
//     user.industry_type
//   ];
//   return await queryAsync(query, values);
// };

// const getAllUsers = async () => {
//     const query = `SELECT * FROM lockene_users`;
//     return await queryAsync(query);
//   };
  
//   const updateUserPassword = async (email, hashedPassword) => {
//     const query = `UPDATE lockene_users SET password = ? WHERE email = ?;`;
//     const values = [hashedPassword, email];
//     return await queryAsync(query, values);
//   };

// module.exports = {
//   findUserByEmail,
//   createUser,
//   getAllUsers,
//   updateUserPassword
// };


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
  const query = `SELECT * FROM lockene_users WHERE LOWER(email) = LOWER(?);`;
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

const createUser = async (user) => {
  try {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const encryptedMobileNumber = encrypt(user.mobile_number);
    const encryptedAddress = encrypt(user.address);
    const encryptedGoogleAddress = encrypt(user.google_address);
    const encryptedCountry = encrypt(user.country);
    const encryptedState = encrypt(user.state);
    const encryptedCity = encrypt(user.city);
    
    const query = `INSERT INTO lockene_users (full_name, company_name, mobile_number, email, password, address, google_address, country, state, city, zipcode, team_size, industry_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
    const values = [
          user.full_name,
          user.company_name,
          encryptedMobileNumber,
          user.email,
          hashedPassword,
          encryptedAddress,
          encryptedGoogleAddress,
          encryptedCountry,
          encryptedState,
          encryptedCity,
          user.zipcode,
          user.team_size,
          user.industry_type
        ];
    
    const result = await queryAsync(query, values);
    
    return result;
  } catch (err) {
    console.error("Error creating user:", err.message);
    throw new Error("Error creating user: " + err.message);
  }
};

const decryptUserData = (users) => {
  return users.map(user => {
    try {
      user.mobile_number = decrypt(user.mobile_number);
      user.address = decrypt(user.address);
      user.google_address = decrypt(user.google_address);
      user.country = decrypt(user.country);
      user.state = decrypt(user.state);
      user.city = decrypt(user.city);
    } catch (err) {
      console.error(`Failed to decrypt mobile number for user ${user.email}:`, err.message);
      user.mobile_number = "Decryption error";
    }
    return user;
  });
};

const getAllUsers = async () => {
  try {
    const query = `SELECT * FROM lockene_users`;
    const results = await queryAsync(query);

    return decryptUserData(results);
  } catch (err) {
    console.error("Error fetching users:", err.message);
    throw new Error("Error fetching users: " + err.message);
  }
};

const updateUserPassword = async (email, hashedPassword) => {
  try {
    const query = `UPDATE lockene_users SET password = ? WHERE email = ?;`;
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




