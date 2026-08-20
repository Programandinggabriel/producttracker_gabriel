require('dotenv').config()
const logger = require('../config/logger');
const { createClient } = require('redis');

const redisClient = createClient({
    url: process.env.REDIS_URL,
    socket: {
        reconnectStrategy: (retries) => {
            if (retries >= 3){
                return new Error("Redis reconnection failed after maximum retries.");
            }

            const delay = Math.min(retries * 1000, 5000);
            return delay
        }
    }
})

let lastLogTime = 0;

redisClient.on('error', (err) => {
    const now = Date.now();
    if(now - lastLogTime > 5000){
        logger.error(err.message, {
            name: err.name,
            data: err.data,
            stack: err.stack,

            code: "REDIS_ERROR"
        });
        
        console.error("Error, no se pudo conectar a redis");
        lastLogTime = now;
    }
});

redisClient.on('connect', ()=> {
    console.log('Conectado a redis...')
})

redisClient.on('ready', () => {
    console.log('¡Redis está listo para usar!')
});

async function connectRedis() {
 try {
    if (!redisClient.isOpen && redisClient.v4Ready !== false) {
        await redisClient.connect();
    }
} catch (error) {
    console.error("Error inicial al ejecutar connect():", error.message);
}
}

module.exports = {
  redisClient,
  connectRedis,
};