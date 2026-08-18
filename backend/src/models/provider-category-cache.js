const { pool } = require('../config/db')

const getCacheState = async (categoryId, providerId) => {
    const result = await pool.query(
        `
        SELECT
            total,
            has_more,
            last_provider_offset,
            last_sync_at
        FROM provider_category_cache
        WHERE category_id = $1
          AND provider_id = $2
        `,
        [categoryId, providerId]
    );

    return result.rows[0] || null;
};

const upsert = async ({
    categoryId,
    providerId,
    total = null,
    hasMore = true,
    lastProviderOffset = 0
}) => {
    const { v4: uuidv4 } = await import('uuid');
    const cacheId = uuidv4().replace(/-/g, '').slice(0, 10);
    const query = `
        INSERT INTO provider_category_cache (
            id,
            category_id,
            provider_id,
            total,
            has_more,
            last_provider_offset
        )
        VALUES ($1, $2, $3, $4, $5, $6)

        ON CONFLICT (category_id, provider_id)
        DO UPDATE SET
            total = EXCLUDED.total,
            has_more = EXCLUDED.has_more,
            last_provider_offset = EXCLUDED.last_provider_offset,
            last_sync_at = NOW(),
            updated_at = NOW()

        RETURNING *;
    `;

    const values = [
        cacheId,
        categoryId,
        providerId,
        total,
        hasMore,
        lastProviderOffset
    ];

    const { rows } = await pool.query(query, values);

    return rows[0];
};

module.exports = {
    getCacheState,
    upsert
}