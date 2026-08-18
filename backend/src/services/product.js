const dbProvider = require("../models/provider");
const dbProduct = require('../models/product');
const dbCategory = require('../models/category');
const redisCache = require('../redis/product');

const productCacheService = require('./cache/product-cache');
const { ThrowError } = require("../errors/AppError");

//Consume tabla con vista previa
const getProducts = async (
    limit,
    offset,
    sortBy,
    order
) => {
    const allowedSort = ['id', 'title', 'price', 'created'];
    const allowedOrder = ['ASC', 'DESC'];
    
    if(!allowedSort.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!allowedOrder.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }

    let allProducts = await dbProduct.getProducts(
        limit,
        offset,
        sortBy,
        order.toUpperCase()
    )
    
    allProducts = await Promise.all(
        allProducts.map(
            async (product) => {
                return {
                    ...product,
                    images: await dbProduct.getProductImages(product.id)
                }
            }
        )
    )
    
    return allProducts;
}

const getQueryProducts = async (
    query,
    limit,
    offset,
    sortBy,
    order
) => {
    const allowedSort = ['id', 'title', 'price', 'created'];
    const allowedOrder = ['ASC', 'DESC'];
    
    if(!allowedSort.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!allowedOrder.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }


    const normalizeQuery = query
        .trim()
        .toLowerCase()
        .replace(/\s+/g, ' ')

    const products = await productCacheService.getQueryProducts(
        query,
        limit + 1,
        offset
    );

    products.sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        let comparison;

        if (typeof valueA === 'number' && typeof valueB === 'number') {
            comparison = valueA - valueB;
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
            const dateA = Date.parse(valueA);
            const dateB = Date.parse(valueB);

            if (!isNaN(dateA) && !isNaN(dateB)) {
                comparison = dateA - dateB;
            } else {
                comparison = valueA.localeCompare(valueB);
            }
        } else {
            comparison = String(valueA).localeCompare(String(valueB));
        }

        return order === 'desc' ? -comparison : comparison;
    });

    const paginatedProducts = products.slice(
        offset,
        offset + limit
    );

    return {
        products: paginatedProducts,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            hasMore: offset + limit < products.length
        }
    };
}


const getProductsByCategory = async (
    idCat, 
    limit, 
    offset, 
    sortBy, 
    order
) => {
    const allowedSort = ['id', 'title', 'price', 'created'];
    const allowedOrder = ['ASC', 'DESC'];
    
    if(!allowedSort.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!allowedOrder.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }


    const products = await productCacheService.getProductsByCategory(
        idCat, 
        limit + 1,
        offset
    );
    
    products.sort((a, b) => {
        const valueA = a[sortBy];
        const valueB = b[sortBy];

        let comparison;

        if (typeof valueA === 'number' && typeof valueB === 'number') {
            comparison = valueA - valueB;
        } else if (typeof valueA === 'string' && typeof valueB === 'string') {
            const dateA = Date.parse(valueA);
            const dateB = Date.parse(valueB);

            if (!isNaN(dateA) && !isNaN(dateB)) {
                comparison = dateA - dateB;
            } else {
                comparison = valueA.localeCompare(valueB);
            }
        } else {
            comparison = String(valueA).localeCompare(String(valueB));
        }

        return order === 'desc' ? -comparison : comparison;
    });
    
    const paginatedProducts = products.slice(
        offset,
        offset + limit
    );

    return {
        products: paginatedProducts,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            hasMore: offset + limit < products.length
        }
    };
};

module.exports = {
    getProducts,
    getQueryProducts,
    getProductsByCategory
}