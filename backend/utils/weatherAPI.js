const axios = require('axios');
require('dotenv').config();

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5';

/**
 * 获取当前天气信息
 * @param {string} city - 城市名称
 * @param {string} units - 单位 (metric/imperial)
 * @returns {Promise<Object>} 天气数据
 */
const getCurrentWeather = async (city, units = 'metric') => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/weather`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: units,
        lang: 'en'
      }
    });

    return {
      success: true,
      data: {
        city: response.data.name,
        country: response.data.sys.country,
        temperature: Math.round(response.data.main.temp),
        feelsLike: Math.round(response.data.main.feels_like),
        humidity: response.data.main.humidity,
        description: response.data.weather[0].description,
        icon: response.data.weather[0].icon,
        windSpeed: response.data.wind.speed,
        visibility: response.data.visibility / 1000, // 转换为公里
        pressure: response.data.main.pressure
      }
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || '获取天气信息失败'
      };
    }
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
};

/**
 * 获取天气预报（5天）
 * @param {string} city - 城市名称
 * @param {string} units - 单位
 * @returns {Promise<Object>} 天气预报数据
 */
const getForecast = async (city, units = 'metric') => {
  try {
    const response = await axios.get(`${WEATHER_API_URL}/forecast`, {
      params: {
        q: city,
        appid: WEATHER_API_KEY,
        units: units,
        lang: 'en'
      }
    });

    return {
      success: true,
      data: response.data.list.map(item => ({
        date: new Date(item.dt * 1000),
        temperature: Math.round(item.main.temp),
        feelsLike: Math.round(item.main.feels_like),
        description: item.weather[0].description,
        icon: item.weather[0].icon,
        humidity: item.main.humidity,
        windSpeed: item.wind.speed
      }))
    };
  } catch (error) {
    if (error.response) {
      return {
        success: false,
        message: error.response.data.message || '获取天气预报失败'
      };
    }
    return {
      success: false,
      message: '网络错误，请稍后重试'
    };
  }
};

module.exports = {
  getCurrentWeather,
  getForecast
};

