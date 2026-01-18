const { getCurrentWeather, getForecast } = require('../utils/weatherAPI');
const { getCache, setCache } = require('../utils/redisClient');

const CURRENT_CACHE_TTL = Number(process.env.WEATHER_CURRENT_CACHE_TTL || 300);
const FORECAST_CACHE_TTL = Number(process.env.WEATHER_FORECAST_CACHE_TTL || 1800);

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

    //使用缓存
    const cacheKey = `weather:current:${city.toLowerCase()}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        message: 'get current weather success',
        data: cached
      });
    }

    const result = await getCurrentWeather(city);

    if (!result.success) {
      return res.status(400).json(result);
    }

    await setCache(cacheKey, result.data, CURRENT_CACHE_TTL);

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

    const cacheKey = `weather:forecast:${city.toLowerCase()}`;
    const cached = await getCache(cacheKey);

    if (cached) {
      return res.json({
        success: true,
        message: 'get forecast weather success',
        data: cached
      });
    }

    const result = await getForecast(city);

    if (!result.success) {
      return res.status(400).json(result);
    }

    await setCache(cacheKey, result.data, FORECAST_CACHE_TTL);

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

