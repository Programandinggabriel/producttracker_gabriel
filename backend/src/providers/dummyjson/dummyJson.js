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


const getProductsByCategory = async (categoryIds, limit=100) => {
    let subLimit = limit;
    
    if(categoryIds.length > 1){
        subLimit = Math.ceil(limit * 0.50);
    }

    const allPromises = await Promise.all(
        categoryIds.map(async (id) => {
            const result = await fetch(`${DUMMY_JSON_API}/category/${id}?limit=${subLimit}`);
            const response = await result.json();
            const products = response.products;
            
            return products.map((product) => mapDummyJsonProduct(product))
        })
    );

    const products = allPromises.flat()
    const productsSliced = products.slice(0, limit)
    
    return productsSliced
}

module.exports = {
    getProductsByIds,
    getProductsByCategory
}
