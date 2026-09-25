const { pool } = require('../config/db')

const getCacheState = async (
    categoryId, 
    providerId,
    min_price_filter,
    max_price_filter
) => {
    let query = `SELECT total,
                        has_more,
                        last_provider_offset,
                        last_sync_at
                    FROM provider_category_cache
                 WHERE category_id = $1
                   AND provider_id = $2`;
    
    let values = [categoryId, providerId]

    if(min_price_filter && max_price_filter){
        query += ` AND min_price_filter = $3
                   AND max_price_filter = $4`
        values.push(min_price_filter, max_price_filter)
    }else{
        query += ` AND min_price_filter IS NULL
                   AND max_price_filter IS NULL`   
    }

    const result = await pool.query(query, values);

    return result.rows[0] || null;
};

const upsert = async ({
    categoryId,
    providerId,
    min_price_filter,
    max_price_filter,
    total = null,
    hasMore = true,
    lastProviderOffset = 0
}) => {
    let queryGet = `SELECT id,
                           category_id,
                           provider_id,
                           total,
                           has_more,
                           last_provider_offset,
                           min_price_filter,
                           max_price_filter
                     FROM provider_category_cache
                    WHERE category_id = $1
                      AND provider_id = $2`;
    let values = [categoryId, providerId];

    if(min_price_filter && max_price_filter){
        queryGet += ` AND min_price_filter = $3
                      AND max_price_filter = $4`
        values.push(min_price_filter, max_price_filter)
    }else{
        queryGet += ` AND min_price_filter IS NULL
                      AND max_price_filter IS NULL`
    }
    
    const { rows } = await pool.query(queryGet, values)    
    let result = rows[0];
    
    if(!result){
        const { v4: uuidv4 } = await import('uuid');
        const cacheId = uuidv4().replace(/-/g, '').slice(0, 10);
        const queryInsert = `INSERT INTO provider_category_cache (
            id,
            category_id,
            provider_id,
            total,
            has_more,
            last_provider_offset,
            min_price_filter,
            max_price_filter
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`;
        const values = [
            cacheId,
            categoryId,
            providerId,
            total,
            hasMore,
            lastProviderOffset,
            min_price_filter,
            max_price_filter
        ];

        const { rows } = await pool.query(queryInsert, values)
        result = rows[0]
    }else{
        let queryUpdate = `UPDATE provider_category_cache 
                              SET has_more = $1,
                                  last_provider_offset = $2,
                                  last_sync_at = NOW(),
                                  updated_at = NOW()
                            WHERE id = $3`;
        const values = [
            hasMore,
            lastProviderOffset,
            result.id
        ];
        const updated = await pool.query(queryUpdate, values);
    }

    return result;
};

module.exports = {
    getCacheState,
    upsert
}