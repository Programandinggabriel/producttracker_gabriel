const { pool } = require('../config/db')

const getProductPriceHistoryById = async(id) => {
    const query = `SELECT id,
                          product_id,
                          direction,
                          old_price,
                          new_price
                    FROM products_price_history
                    WHERE id = $1`;
    const values = [id];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const getProductPriceHistoryByProductId = async(id) => {
    const query = `SELECT id,
                          product_id,
                          direction,
                          old_price,
                          new_price
                    FROM products_price_history
                    WHERE product_id = $1`;
    const values = [id];

    const { rows } = await pool.query(query, values);

    return rows
}


const createProductPriceHistory = async (
    idProduct, 
    direction,
    oldPrice, 
    newPrice
) => {
    const { v4: uuidv4 } = await import('uuid');
    const historyId = uuidv4().replace(/-/g, '').slice(0, 10);
    
    const query = `
        INSERT INTO products_price_history(
            id,
            product_id,
            direction,
            old_price, 
            new_price
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;

    const values = [
        historyId, 
        idProduct,
        direction,
        oldPrice, 
        newPrice
    ];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

module.exports = {
    getProductPriceHistoryById,
    getProductPriceHistoryByProductId,
    createProductPriceHistory
}