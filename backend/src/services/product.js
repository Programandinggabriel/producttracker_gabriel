const dbProduct = require('../models/product');
const dbProvider = require('../models/provider')

const productCacheService = require('./cache/product-cache');
const { ThrowError } = require("../errors/AppError");
const { mapPreviewProduct, mapDetailProduct } = require('./utils/response-product-mapper');

//Consume tabla con vista previa
const getProducts = async (
    limit,
    offset,
    sortBy,
    order
) => {
    if(!dbProduct.ALLOWED_SORTBY.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!dbProduct.ALLOWED_ORDER.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }

    const allProducts = await dbProduct.getProducts(
        limit,
        offset,
        sortBy,
        order.toUpperCase()
    )
    
    const previewData = await Promise.all(
        allProducts.map(
            async (product) => {
                const arrayImgs = await dbProduct.getProductImages(product.id)
                product.images = arrayImgs.map(img => img.image)
                
                return mapPreviewProduct(product)
            }
        )
    )

    return previewData.flat();
}

const getQueryProducts = async (
    query,
    limit,
    offset,
    sortBy,
    order
) => {    
    if(!query){
       throw new ThrowError(
            'Params query is required',
            400,
            'BAD_REQUEST'
        ) 
    }

    if(!dbProduct.ALLOWED_SORTBY.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!dbProduct.ALLOWED_ORDER.includes(order.toUpperCase())){
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

    const previewData = await productCacheService.getQueryProducts(
        normalizeQuery,
        limit + 1,
        offset
    );

    previewData.sort((a, b) => {
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

    const paginated = previewData.slice(
        offset,
        offset + limit
    );

    return {
        products: paginated,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            hasMore: offset + limit < previewData.length
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
    if(!dbProduct.ALLOWED_SORTBY.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!dbProduct.ALLOWED_ORDER.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }

    const previewData = await productCacheService.getProductsByCategory(
        idCat, 
        limit + 1,
        offset
    );
    
    previewData.sort((a, b) => {
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
    
    const paginated = previewData.slice(
        offset,
        offset + limit
    );

    return {
        products: paginated,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            hasMore: offset + limit < previewData.length
        }
    };
};

const getProductById = async (
    providerID,
    externalId
) => {
    if(!providerID || !externalId){
        throw new ThrowError(
            'provider or external id is missing',
            400,
            'BAD_REQUEST'
        )
    }

    const provider = await dbProvider.getProvider(providerID);
    const objProvider = provider.provider;
    
    if(provider.rowCount === 0){
        throw new ThrowError(
            'Provider not exists',
             400,
            'BAD_REQUEST'
        )
    }


    const productDb = await dbProduct.getProduct(externalId, providerID);
    if(productDb){
        const images = await dbProduct.getProductImages(productDb.id);
        productDb.images = images.map(img => img.image)

        return mapDetailProduct(productDb)
    }

    const productDbExternal = await dbProduct.getExternalProduct(providerID, externalId)
    const externalProduct = productDbExternal.product;
    if(externalProduct){
        const images = await dbProduct.getExternalProductImages(externalProduct.id);
        externalProduct.providerId = externalProduct.provider_id
        externalProduct.productId = externalProduct.product_id

        delete externalProduct.provider_id
        delete externalProduct.product_id

        externalProduct.images = images.map(img => img.image)
        
        return mapDetailProduct(externalProduct)
    }

    const productCache = await productCacheService.findProductInCache(
        providerID,
        externalId
    );
    if(productCache){
        return mapDetailProduct(productCache)
    }

    const result = await objProvider.module.getProductsByIds([externalId]);
    const product = result.flat()[0]
    if(product){
        return mapDetailProduct(product)
    }

    throw new ThrowError(
        'Product not found',
        404,
        'PRODUCT_NOT_FOUND'
    )
}

module.exports = {
    getProducts,
    getQueryProducts,
    getProductsByCategory,
    getProductById
}