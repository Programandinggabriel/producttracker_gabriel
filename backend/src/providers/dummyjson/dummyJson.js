require('dotenv').config()
const { Product } = require('../../models/product');
const mapDummyJsonProduct = require('./product-mapper');

const DUMMY_JSON_API = process.env.DUMMYJSON_PRODUCTS_API

//Funcion para el job
const getProductsByIds = async (arrayIds) => {
    const products = await Promise.all(
        arrayIds.map(async (id) => {
            const result = await fetch(`${DUMMY_JSON_API}/${id}`);
            const product = await result.json();

            return mapDummyJsonProduct(product)
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
