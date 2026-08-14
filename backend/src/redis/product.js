const { redisClient } = require("./redisClient");

//Cachea productos por category y provedor
async function cacheProductsByCategory(idCategory, products) {
    const provider = products[0]?.providerId;

    if (!provider || !products.length) {
        return;
    }

    const redisKey = `products:provider:${provider}:category${idCategory}`;
    const timeCache = 60 * 60;

    const exists = await redisClient.exists(redisKey);

    for (const product of products){
        const productId = product.productId.toString();

        await redisClient.hSet(
            redisKey,
            productId,
            JSON.stringify(product)
        );
    }

    if(!exists){
        await redisClient.expire(redisKey, timeCache)
    }
}

async function getCacheProductsByCategory(idCategory, provider) {
    const redisKey = `products:provider:${provider}:category${idCategory}`;
    const products = await redisClient.hVals(redisKey);
    
    return products.map(product => JSON.parse(product))
}


async function validateCacheCategory(idCategory, provider) {
    const redisKey = `products:provider:${provider}:category${idCategory}`;
    const exist = Boolean(await redisClient.exists(redisKey));
    return exist
}

module.exports = {
    cacheProductsByCategory,
    getCacheProductsByCategory,
    validateCacheCategory
}