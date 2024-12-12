const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');
const predictionRoutes = require('./routes/predictions');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/', authRoutes);
app.use('/', profileRoutes);
app.use('/', predictionRoutes);

module.exports = app;