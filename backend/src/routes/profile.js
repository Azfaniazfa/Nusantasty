const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const multer = require('multer');
const upload = multer();
const { getProfile, saveProfile } = require('../controllers/profileController');

router.get('/profile/:uid', verifyToken, getProfile);
router.post('/save-profile', verifyToken, upload.single('photo'), saveProfile);

module.exports = router;