const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/verifyToken');
const { body, validationResult } = require('express-validator');
const { storePrediction } = require('../controllers/predictionController');
const errorResponse = require('../utils/errorResponse');

router.post(
  '/store',
  verifyToken,
  [body('prediction').notEmpty().withMessage('Prediction is required')],
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return errorResponse(res, 400, errors.array().map(err => err.msg).join(', '));
    }
    next();
  },
  storePrediction
);

module.exports = router;