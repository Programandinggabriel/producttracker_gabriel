require('dotenv').config()
const { Product } = require('../../models/product');
const mapDummyJsonProduct = require('./product-mapper');

const DUMMY_JSON_API = process.env.DUMMYJSON_PRODUCTS_API

const getProductsByIds = async (arrayIds) => {
    const products = await Promise.all(
        arrayIds.map(async (id) => {
            const result = await fetch(`${DUMMY_JSON_API}/${id}`);
            
            if(result.ok){
                const product = await result.json();
                return mapDummyJsonProduct(product)
            }else if(result.status === 404){
                return [];
            }else{
                const error = await response.text();

                throw new ThrowError(
                    `Error obteniendo producto por ID`,
                    500,
                    'API_DUMMYJSON_ERROR',
                    {
                        product_id: id,
                        api_dummyjson_status: response.status,
                        api_dummyjson_error: error
                    }
                )
            
            }
            
        })
    );

    return products
}

const queryProducts = async (
    query, 
    limit,
    offset
) => {
    const params = new URLSearchParams({
        q: query,
        limit: limit,
        skip: offset
    });
    const result = await fetch(`${DUMMY_JSON_API}/search?${params}`);
    
    if(!result.ok){
        const error = await response.text();
        throw new ThrowError(
            `Error obteniendo producto por ID`,
            500,
            'API_DUMMYJSON_ERROR',
            {
                product_id: id,
                api_dummyjson_status: response.status,
                api_dummyjson_error: error
            }
        )
    }

    const response = await result.json();
    const products = response.products;

    return products.map((product) => mapDummyJsonProduct(product))
}


const getProductsByCategory = async (categoryIds, limit, offset) => {
    if (!categoryIds.length) {
        return [];
    }

    const categoryCount = categoryIds.length;

    let baseLimit = Math.floor(limit / categoryCount);
    let remainder = limit % categoryCount;

    const results = await Promise.all(
        categoryIds.map(async (id, index) => {
            const subLimit = baseLimit + (index < remainder ? 1 : 0);
            
            if (subLimit === 0){
                return [];
            }

            const params = new URLSearchParams({
                limit: subLimit,
                skip: offset
            })

            const result = await fetch(
                `${DUMMY_JSON_API}/category/${id}?${params}`
            );

            if(!result.ok){
                const error = await response.text();

                throw new ThrowError(
                    `Error obteniendo producto por ID`,
                    500,
                    'API_DUMMYJSON_ERROR',
                    {
                        product_id: id,
                        api_dummyjson_status: response.status,
                        api_dummyjson_error: error
                    }
                )
            }

            const response = await result.json();

            return response.products.map(
                product => mapDummyJsonProduct(product)
            );
        })
    );
    
    return results.flat();
}

module.exports = {
    getProductsByIds,
    queryProducts,
    getProductsByCategory
}
