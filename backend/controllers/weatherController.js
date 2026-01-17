const { getCurrentWeather, getForecast } = require('../utils/weatherAPI');

/**
 * 获取当前天气
 */
const getCurrent = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'please provide city name'
      });
    }

    const result = await getCurrentWeather(city);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'get current weather success',
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'get current weather failed',
      error: error.message
    });
  }
};

/**
 * 获取天气预报
 */
const getForecastWeather = async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.status(400).json({
        success: false,
        message: 'please provide city name'
      });
    }

    const result = await getForecast(city);

    if (!result.success) {
      return res.status(400).json(result);
    }

    res.json({
      success: true,
      message: 'get forecast weather success',
      data: result.data
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'get forecast weather failed',
      error: error.message
    });
  }
};

module.exports = {
  getCurrent,
  getForecastWeather
};

