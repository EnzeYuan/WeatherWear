const redis = require('redis');
require('dotenv').config();

const REDIS_URL = process.env.REDIS_URL || 'redis://:19782100@192.168.129.131:6379';

const client = redis.createClient({ url: REDIS_URL });
let isReady = false;

client.on('ready', () => {
  isReady = true;
});

client.on('end', () => {
  isReady = false;
});

client.on('error', (error) => {
  console.error('Redis client error:', error);
});

(async () => {
  try {
    await client.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
  }
})();

const getCache = async (key) => {
  if (!isReady) {
    return null;
  }

  try {
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const setCache = async (key, value, ttlSeconds) => {
  if (!isReady) {
    return false;
  }

  try {
    const payload = JSON.stringify(value);
    if (ttlSeconds && Number.isFinite(ttlSeconds)) {
      await client.setEx(key, ttlSeconds, payload);
    } else {
      await client.set(key, payload);
    }
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

module.exports = {
  getCache,
  setCache
};

