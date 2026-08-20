require('dotenv').config()
const { pool } = require('../config/db')

const addExtraData = (provider) => {
    if(provider.name === 'dummyjson'){
        provider.module = require('../providers/dummyjson/dummyJson')
    }else if(provider.name === 'ebay'){
        provider.module = require('../providers/ebay/ebay')
    }
    
    return provider
}

const getProvider = async(name) => {
    const query = `SELECT * FROM providers 
                   WHERE name = $1
                   AND active = true`;
    const values = [name];

    const { rows, rowCount } = await pool.query(query, values)
    let provider = rows[0]
    
    if(rowCount > 0){
        provider = addExtraData(provider)
    }
    
    return {
        provider: provider,
        rowCount: rowCount
    };
}

const getProviderToken = async (name) => {
    const query = `SELECT token 
                    FROM providers
                   WHERE name = $1`
    
    const values = [name]

    const { rows } = await pool.query(query, values)
    
    return rows[0]
}

const getProviders = async () => {
    const query = `SELECT * 
                    FROM providers 
                   WHERE active = true`;
    
    const { rows, rowCount } = await pool.query(query);
    let providers; 

    providers = rows.map((item) => {
        return addExtraData(item)
    })
    
    return providers;
}

const updateProviderToken = async (name, token) => {
    const query = `UPDATE providers 
                    SET token = $1,
                        updated = NOW()
                   WHERE name = $2
                   RETURNING *`;
    const values = [token, name]

    const { rows } = await pool.query(query, values)
    
    return rows[0]
}

module.exports = {
    getProvider,
    getProviders,
    getProviderToken,
    updateProviderToken
};