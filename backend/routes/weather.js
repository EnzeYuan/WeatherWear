const express = require('express');
const router = express.Router();
const { getCurrent, getForecastWeather } = require('../controllers/weatherController');

router.get('/current', getCurrent);
router.get('/forecast', getForecastWeather);

module.exports = router;

