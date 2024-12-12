const pool = require("../config/mysql");

exports.createUser = async (uid, email) => {
  const query = "INSERT INTO users (uid, email) VALUES (?, ?);";
  await pool.query(query, [uid, email]);
};

exports.getUserProfile = async (uid) => {
  const query = "SELECT name, photo_url FROM users WHERE uid = ?";
  const [rows] = await pool.execute(query, [uid]);
  return rows[0];
};

exports.saveUserProfile = async (uid, name, photoUrl) => {
  const query = `
  UPDATE users
    SET name = ?, photo_url = ?
    WHERE uid = ?;
  `;
  await pool.query(query, [name, photoUrl, uid]);
};
