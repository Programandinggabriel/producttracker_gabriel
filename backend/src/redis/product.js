const logger = require('../config/logger');
const { redisClient } = require("./redisClient");

function logRedisError (err) {
    logger.error(err.message, {
        name: err.name,
        data: err.data,
        stack: err.stack,

        code: "REDIS_ERROR"
    });
}

//Cachea query de productos
async function cacheProductsQuery(
    query,
    offset,
    products
) {
    try{
        const redisKey = `products:query:${query}`;
        const cacheField = String(offset);

        const timeCache = 600

        await redisClient.hSet(
            redisKey, 
            cacheField, 
            JSON.stringify(products)
        )
        await redisClient.expire(redisKey, timeCache)
        return true
    }catch (error){
        logRedisError(error)
        return false
    }
    
}

async function getCacheQueryProducts(query, offset) {
    try{
        const redisKey = `products:query:${query}`;
        const cacheField = String(offset)

        const cached = await redisClient.hGet(
            redisKey,
            cacheField
        )

        if (!cached) {
            return {
                available: true,
                hit: false,
                products: []
            };
        }

        return {
            available: true,
            hit: true,
            products: JSON.parse(cached)
        }
    }catch(error){
        logRedisError(error)
        return {
            available: false,
            hit: false,
            products: []
        };
    }
}

//Cachea productos por category y provedor 
//KEY - FIELD - VALUE
async function cacheProductsByCategory(
    idCategory,
    provider,
    offset,
    products
) {
    try{
        const redisKey = `products:provider:${provider}:category:${idCategory}`;
        const cacheField = String(offset);

        await redisClient.hSet(
            redisKey,
            cacheField,
            JSON.stringify(products)
        );

        return true;
        
    }catch(error){
        logRedisError(error)
        return false;
    }
}

async function getCacheProductsByCategory(idCategory, provider, offset) {
    try{
        const redisKey = `products:provider:${provider}:category:${idCategory}`;
        const cacheField = String(offset);

        const productData = await redisClient.hGet(redisKey, cacheField)
        
        if (!productData) {
            return {
                available: true,
                hit: false,
                products: []
            };
        }

        return {
            available: true,
            hit: true,
            products: JSON.parse(productData)
        }
    }catch(error){
        logRedisError(error);

        return {
            available: false,
            hit: false,
            products: []
        };
    }
}

module.exports = {
    cacheProductsByCategory,
    getCacheProductsByCategory,
    cacheProductsQuery,
    getCacheQueryProducts
}