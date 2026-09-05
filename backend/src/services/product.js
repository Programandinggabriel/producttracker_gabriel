const dbProduct = require('../models/product');
const dbProvider = require('../models/provider')
const dbUser = require('../models/user')

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
                const provider = await dbProvider.getProvider(product.providerId);
                const objProvider = provider.provider;
                const arrayImgs = await dbProduct.getProductImages(product.id)
                
                product.images = arrayImgs.map(img => img.image)
                product.provider = {
                    id: objProvider.name,
                    logo: objProvider.logo,
                    nickname: objProvider.nickname
                }

                return mapPreviewProduct(product)
            }
        )
    );

    return {
        products: previewData,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            hasMore: limit <= previewData.length
        }
    }
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
    userId,
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
            'Provider inactive or dont exists',
             422,
            'BAD_REQUEST'
        )
    }

    const isUserFavorite = await dbUser.getDbUserProductFavorite(userId, providerID, externalId);
    const isFavorite = isUserFavorite ? true : false;
    
    const productCache = await productCacheService.findProductInCache(
        providerID,
        externalId
    );
    if(productCache){
        productCache.provider = {
            id: objProvider.name,
            logo: objProvider.logo,
            nickname: objProvider.nickname
        }
        productCache.isFavorite = isFavorite
        return mapDetailProduct(productCache)
    }

    const result = await objProvider.module.getProductsByIds([externalId]);
    const product = result.flat()[0]
    if(product){
        product.provider = {
            id: objProvider.name,
            logo: objProvider.logo,
            nickname: objProvider.nickname
        }
        product.isFavorite = isFavorite
        
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