const service = require('../services/provider')

const getProviders = async (req, res, next) => {
    try {
        const providers = await service.getProviders()
        res.status(200).json(providers)
    }catch(error){
        next(error)
    }
}

module.exports = { 
    getProviders
}