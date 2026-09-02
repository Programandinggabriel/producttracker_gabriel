const dbProvider = require('../models/provider')

const getProviders = async () => {
    const providers = await dbProvider.getProviders();

    return providers.map(prov => {
        return {
            id: prov.name,
            logo: prov.logo,
            name: prov.nickname
        }
    })

}

module.exports = {
    getProviders
}