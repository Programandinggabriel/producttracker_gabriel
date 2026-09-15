const { redisClient, logRedisError } = require('../redis/redisClient')

const setUserToken = async (id, token) => {
    try{
        const hash = `user:${id}:tokens`;
        let field = 1;
        const value = token;

        const currentFields = await redisClient.hKeys(hash);
        if(currentFields.length > 0){
            const sorted = currentFields.sort((a, b) => a-b) // >0 b, a 0< a, b
            field = Number(sorted[sorted.length - 1]) + 1
        }

        await redisClient.hSet(hash, field, value);

        if(field === 1){
            const expire = (12 * 60) * 60; //12 hours
            await redisClient.expire(hash, expire);
        }

        return true;
    }catch(error){
        logRedisError(error)
        return false;
    }
}

const validateUserToken = async (id, token) => {
    try{
        const hash = `user:${id}:tokens`;
        const currentTokens = await redisClient.hVals(hash);

        const tokenExists = currentTokens.find(item => item === token);
        
        if (tokenExists) {
            return {
                available: true,
                hit: true,
                token: tokenExists
            };
        }else{
            return {
                available: true,
                hit: false,
                token: tokenExists
            };
        }
    }catch(error){
        logRedisError(error)
        return {
            available: false,
            hit: false,
            token: ''
        };
    }
}

module.exports = {
    setUserToken,
    validateUserToken
}