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
  const query = `SELECT * FROM lockene_users WHERE LOWER(email) = LOWER(${db.escape(
    email
  )});`;
  const results = await queryAsync(query);
  return results[0];
};

const createUser = async (user) => {
  const hashedPassword = await bcrypt.hash(user.password, 10);
  const query = `INSERT INTO lockene_users (full_name, company_name, mobile_number, email, password, address, google_address, country, state, city, zipcode, team_size, industry_type) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`;
  // id	full_name	company_name	mobile_number	email	password	
  //address	google_address	country	state	city	zipcode	team_size	industry_type	
  const values = [
    user.full_name,
    user.company_name,
    user.mobile_number,
    user.email,
    hashedPassword,
    user.address,
    user.google_address,
    user.country,
    user.state,
    user.city,
    user.zipcode,
    user.team_size,
    user.industry_type
  ];
  return await queryAsync(query, values);
};

const getAllUsers = async () => {
    const query = `SELECT * FROM lockene_users`;
    return await queryAsync(query);
  };
  
  const updateUserPassword = async (email, hashedPassword) => {
    const query = `UPDATE lockene_users SET password = ? WHERE email = ?;`;
    const values = [hashedPassword, email];
    return await queryAsync(query, values);
  };

module.exports = {
  findUserByEmail,
  createUser,
  getAllUsers,
  updateUserPassword
};
