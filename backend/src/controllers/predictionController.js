const pool = require('../config/mysql');
const errorResponse = require('../utils/errorResponse');

exports.storePrediction = async (req, res) => {
  const { prediction } = req.body;
  const { uid } = req.user;

  try {
    const query = 'INSERT INTO prediction_histories (uid, prediction) VALUES (?, ?);';
    await pool.query(query, [uid, prediction]);

    res.status(201).json({ message: 'Prediction stored successfully' });
  } catch (error) {
    console.error('Error storing prediction:', error);
    errorResponse(res, 500, 'Failed to store prediction');
  }
};