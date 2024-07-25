const db = require("../../Config/connection");
const bcrypt = require("bcryptjs");

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
  const query = `SELECT * FROM users WHERE LOWER(email) = LOWER(${db.escape(
    email
  )});`;
  const results = await queryAsync(query);
  return results[0];
};

const createUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const query = `INSERT INTO users (full_name, email, password, mobile_number) VALUES (?, ?, ?, ?);`;
  const values = [
    user.full_name,
    user.email,
    hashedPassword,
    user.mobile_number,
  ];
  return await queryAsync(query, values);
};

const getAllUsers = async () => {
    const query = `SELECT * FROM users`;
    return await queryAsync(query);
  };
  
  const updateUserPassword = async (email, hashedPassword) => {
    const query = `UPDATE users SET password = ? WHERE email = ?;`;
    const values = [hashedPassword, email];
    return await queryAsync(query, values);
  };

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers,
  updateUserPassword
};
