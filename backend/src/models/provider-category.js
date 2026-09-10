const { pool } = require('../config/db');

const getProviderCategoriesIn = async (provider, categories) => {
    const query = `SELECT id,
                          external_id,
                          name
                    FROM provider_category
                   WHERE provider = $1 
                     AND external_id = ANY($2)`;
    const values = [provider, categories];

    const { rows } = await pool.query(query, values)

    return rows
}

module.exports = {
    getProviderCategoriesIn
}