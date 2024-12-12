const userModel = require('../models/userModel');
const { bucket, bucketName } = require('../config/bucket');
const errorResponse = require('../utils/errorResponse');

exports.getProfile = async (req, res) => {
  const { uid } = req.params;

  if (req.user.uid !== uid) {
    return errorResponse(res, 403, 'Unauthorized access');
  }

  try {
    const profile = await userModel.getUserProfile(uid);

    if (!profile) {
      return errorResponse(res, 404, 'Profile not found');
    }

    res.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    errorResponse(res, 500, 'Failed to fetch profile');
  }
};

exports.saveProfile = async (req, res) => {
  const { uid, name } = req.body;
  let photoUrl = req.body.photoUrl;

  try {
    if (req.file) {
      const blob = bucket.file(`users/${uid}/${req.file.originalname}`);
      const blobStream = blob.createWriteStream();

      blobStream.on('error', (err) => {
        console.error('Error uploading file:', err);
        return errorResponse(res, 500, 'Failed to upload photo');
      });

      await new Promise((resolve, reject) => {
        blobStream.on('finish', resolve);
        blobStream.end(req.file.buffer);
      });

      photoUrl = `https://storage.googleapis.com/${bucketName}/users/${uid}`;
    }

    await userModel.saveUserProfile(uid, name, photoUrl);
    res.status(200).json({ message: 'User profile saved successfully' });
  } catch (error) {
    console.error('Error saving user:', error);
    errorResponse(res, 500, 'Failed to save user profile');
  }
};