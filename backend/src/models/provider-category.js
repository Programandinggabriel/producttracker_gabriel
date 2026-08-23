const { pool } = require('../config/db');

const getProviderCategories = async (provider, limit) => {
    const query = `SELECT id,
                          external_id,
                          name 
                    FROM provider_category
                   WHERE provider = $1
                   ORDER BY id 
                   LIMIT $2`;
    
    const values = [provider, limit];

    const { rows } = await pool.query(query, values);

    return rows
}

module.exports = {
    getProviderCategories
}