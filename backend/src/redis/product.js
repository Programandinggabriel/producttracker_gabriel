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
    provider,
    query,
    offset,
    products
) {
    try{
        const redisKey = `products:provider:${provider}:query:${query}`;
        const cacheField = String(offset);

        const timeCache = 30; //min

        await redisClient.hSet(
            redisKey, 
            cacheField, 
            JSON.stringify(products)
        )
        await redisClient.expire(redisKey, timeCache * 60)
        return true
    }catch (error){
        logRedisError(error)
        return false
    }
    
}

async function getCacheQueryProducts(
    provider,
    query,
    offset
) {
    try{
        const redisKey = `products:provider:${provider}:query:${query}`;
        const cacheField = String(offset);

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

        const timeCache = 120; //min

        await redisClient.hSet(
            redisKey,
            cacheField,
            JSON.stringify(products)
        );

        await redisClient.expire(redisKey, timeCache * 60)

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

async function findProduct(provider, externalId) {
    let product = null;
    try{
        const queryKey = 'products:*';
        const matchKeys = [];
        const iterator = redisClient.scanIterator({
            MATCH: queryKey,
            COUNT: 100
        });

        for await(const key of iterator){
            matchKeys.push(key)
        }
        
        if(matchKeys.length === 0){
            return {
                available: true,
                hit: false,
                product: product
            };
        }

        
        let wasFound = false;
        for(const batch of matchKeys){
            for(const key of batch){
                const values = await redisClient.hVals(key);
                const products = values.map(str => {
                    try{
                        return JSON.parse(str);
                    }catch(error){
                        logRedisError(error)
                        return null;
                    }
                }).filter(p => p !== null);

                const productFind = products.find((product) => {
                    return product.providerId === provider &&
                        product.productId === externalId;
                });
                
                if(productFind){
                    product = productFind
                    wasFound = true
                    break;
                }
            }
            if(wasFound) break;
        }
        
        return {
            available: true,
            hit: true,
            product: product
        };

    }catch(error){
        logRedisError(error)

        return {
            available: false,
            hit: false,
            product: product
        };
    }
}


module.exports = {
    cacheProductsByCategory,
    getCacheProductsByCategory,
    cacheProductsQuery,
    getCacheQueryProducts,
    findProduct
}