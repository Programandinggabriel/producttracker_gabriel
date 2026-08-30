const { pool } = require('../config/db')

const ALLOWED_DIRECTIONS = [
    'INCREASE',
    'DECREASE'
];

const getAllActiveUserProductsPriceAlerts = async() => {
    const query = `SELECT id,
                          user_id,
                          product_id,
                          target_price,
                          direction
                    FROM products_price_alerts
                   WHERE active = true`;
    
    const { rows } = await pool.query(query);
    return rows;
}

const getUsersProductPriceAlerts = async() =>{
    const query = `SELECT user_id, 
                          STRING_AGG(id, ', ') as user_alerts
                    FROM products_price_alerts
                    WHERE active = true
                   GROUP BY user_id`;
    const { rows } = await pool.query(query);

    return rows
}

const getProductPriceAlertById = async (id) => {
    const query = `SELECT id,
                          user_id,
                          product_id,
                          target_price,
                          direction,
                          active,
                          created,
                          updated
                     FROM products_price_alerts
                    WHERE id = $1`;
    const values = [id];

    const { rows } = await pool.query(query, values);
    
    return rows[0]
}

const getUserProductPriceAlert = async (idUser, alertDirection ,provider, idProd) => {
    const query = `SELECT alerts.id
                    FROM products_price_alerts alerts
                    JOIN external_products eprods
                      ON alerts.product_id = eprods.id
                   WHERE alerts.user_id = $1
                     AND alerts.direction = $2
                     AND eprods.provider_id = $3
                     AND eprods.product_id = $4`;
    const values = [idUser, alertDirection, provider, idProd];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const getUserPriceAlerts = async (idUser) => {
    const query = `SELECT id,
                          product_id,
                          target_price,
                          direction,
                          active
                    FROM products_price_alerts
                   WHERE user_id = $1`;
    const values = [idUser];

    const { rows } = await pool.query(query, values);

    return rows
}

const getUserPriceAlert = async(idUser, idAlert) => {
    const query = `SELECT id 
                    FROM products_price_alerts
                   WHERE user_id = $1
                     AND id = $2`;
    const values = [idUser, idAlert];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const createUserProductPriceAlert = async (
    idUser, 
    idProd, 
    priceTarget,
    direction
) => {
    const { v4: uuidv4 } = await import('uuid');
    const alertId = uuidv4().replace(/-/g, '').slice(0, 10);
    
    const query = `INSERT INTO products_price_alerts
                    (id, user_id, product_id, target_price, direction)
	               VALUES ($1, $2, $3, $4, $5)
                   RETURNING *`;
    const values = [alertId, idUser, idProd, priceTarget, direction.toUpperCase()];
    
    const { rows } = await pool.query(query, values);

    return rows[0]
}

const updateUserProductPriceAlert =  async (
    idUser,
    idAlert,
    priceTarget,
    direction,
    active
) => {
    const query = `UPDATE products_price_alerts
	                SET target_price = $1, 
                        direction = $2, 
                        active = $3,
                        updated = NOW()
	               WHERE user_id = $4
                     AND id = $5
                   RETURNING *`;
    const values = [priceTarget, direction.toUpperCase(), active, idUser, idAlert];

    const { rows } = await pool.query(query, values);

    return rows[0];
}

const deleteUserProductPriceAlert = async (userId, alertId) => {
    const query = `DELETE FROM products_price_alerts
                   WHERE user_id = $1
                     AND id = $2`;
    
    const values = [userId, alertId];

    const { rowCount } = await pool.query(query, values);

    return rowCount > 0
}

module.exports = {
    ALLOWED_DIRECTIONS,
    getProductPriceAlertById,
    getAllActiveUserProductsPriceAlerts,
    getUsersProductPriceAlerts,
    getUserProductPriceAlert,
    getUserPriceAlerts,
    getUserPriceAlert,
    createUserProductPriceAlert,
    updateUserProductPriceAlert,
    deleteUserProductPriceAlert
}