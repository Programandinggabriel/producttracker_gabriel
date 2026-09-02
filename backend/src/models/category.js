const { pool } = require('../config/db');

const getCategories = async () => {
    const query = `SELECT id,
                          name,
                          slug
                   FROM category`;
    const { rows } = await pool.query(query)

    return rows;
}

const getCategoryProvider = async (id, provider) => {
    const query = `SELECT pcat.external_id as prov_category_id
                    FROM category cat
                    JOIN provider_category pcat
                      ON cat.id = pcat.category_id
                   WHERE cat.id = $1
                     AND pcat.provider = $2
                   ORDER BY pcat.id`;
    const values = [id, provider];

    const { rows } = await pool.query(query, values)

    return rows
}

module.exports = {
    getCategories,
    getCategoryProvider
}