const admin = require('../config/firebase');
const userModel = require('../models/userModel');
const errorResponse = require('../utils/errorResponse');

exports.signup = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await admin.auth().createUser({ email, password });
    await userModel.createUser(user.uid, email);

    res.status(201).json({ message: 'User created and stored successfully', user });
  } catch (error) {
    console.error('Error during signup:', error);
    errorResponse(res, 400, error.message);
  }
};