require('dotenv').config()
const logger = require('../config/logger');
const { createClient } = require('redis');


const redisClient = createClient({
    url: process.env.REDIS_URL
})

redisClient.on('error', (err) => {
    logger.error(err.message, {
        name: err.name,
        data: err.data,
        stack: err.stack,

        code: "REDIS_ERROR"
    });
    
    console.error("Redis Error:", err);
})

redisClient.on('connect', ()=> {
    console.log('Conectado a redis')
})

redisClient.on('ready', () => {
    console.log('¡Redis está listo para usar!')
});

async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

module.exports = {
  redisClient,
  connectRedis,
};