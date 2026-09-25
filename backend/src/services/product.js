const dbProduct = require('../models/product');
const dbProvider = require('../models/provider')
const dbUser = require('../models/user')

const productCacheService = require('./cache/product-cache');
const { ThrowError } = require("../errors/AppError");
const { mapPreviewProduct, mapDetailProduct } = require('./utils/response-product-mapper');

const ALLOWED_SORTBY = ['price', 'currency'];
const ALLOWED_ORDER = ['ASC', 'DESC'];

//Consume tabla con vista previa
const getProducts = async (
    limit,
    offset,
    sortBy,
    order,
    provider_filter,
    min_price_filter,
    max_price_filter
) => {
    if(!ALLOWED_SORTBY.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!ALLOWED_ORDER.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }

    if(provider_filter){
        const regex = /\[.*\]/;

        if(!regex.test(provider_filter)){
            throw new ThrowError(
                'Not valid array provider',
                400,
                'BAD_REQUEST'
            )
        }

        provider_filter = provider_filter.slice(1, -1).split(', ');
    }

    const regexOnlyNumbers = /^\d+(\.\d{1,2})?$/;

    if((min_price_filter && !regexOnlyNumbers.test(min_price_filter)) || 
        (max_price_filter && !regexOnlyNumbers.test(max_price_filter))
    ){
        throw new ThrowError(
            'Invalid formats filter price',
            400,
            'BAD_REQUEST'
        )
    }

    const allProducts = await dbProduct.getProducts(
        limit,
        offset,
        sortBy,
        order.toUpperCase(),
        provider_filter,
        min_price_filter,
        max_price_filter
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

    let filters = {};

    if(provider_filter){
        filters.provider = provider_filter
    }
    if(min_price_filter && max_price_filter){
        filters.min_price = min_price_filter
        filters.max_price = max_price_filter
    }

    return {
        products: previewData,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            filters,
            hasMore: limit <= previewData.length
        }
    }
}

const getQueryProducts = async (
    query,
    limit,
    offset,
    sortBy,
    order,
    provider_filter,
    min_price_filter,
    max_price_filter
) => {    
    if(!query){
       throw new ThrowError(
            'Params query is required',
            400,
            'BAD_REQUEST'
        ) 
    }

    if(!ALLOWED_SORTBY.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!ALLOWED_ORDER.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }

    if(provider_filter){
        const regex = /\[.*\]/;

        if(!regex.test(provider_filter)){
            throw new ThrowError(
                'Not valid array provider',
                400,
                'BAD_REQUEST'
            )
        }

        provider_filter = provider_filter.slice(1, -1).split(', ');

        for (const provider of provider_filter){
            const exists = await dbProvider.getProvider(provider)
            if(exists.rowCount === 0){
                throw new ThrowError(
                    `Provider ${provider} not exists`,
                    404,
                    'PROVIDER_NOT_FOUND'
                )
            }
        }
    }

    const regexOnlyNumbers = /^\d+(\.\d{1,2})?$/;

    if((min_price_filter && !regexOnlyNumbers.test(min_price_filter)) || 
        (max_price_filter && !regexOnlyNumbers.test(max_price_filter))
    ){
        throw new ThrowError(
            'Invalid formats filter price',
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
        offset,
        provider_filter,
        min_price_filter,
        max_price_filter
    );

    const paginated = previewData.slice(
        offset,
        offset + limit
    );

    
    paginated.sort((a, b) => {
        const mapperColumns = {
            price: 'price',
            currency: 'currency',
        }

        const column = mapperColumns[sortBy];

        const valueA = a[column];
        const valueB = b[column];

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

    let filters = {};

    if(provider_filter){
        filters.provider = provider_filter
    }
    if(min_price_filter && max_price_filter){
        filters.min_price = min_price_filter
        filters.max_price = max_price_filter
    }

    return {
        products: paginated,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            filters,
            hasMore: offset + limit < previewData.length
        }
    };
}

const getProductsByCategory = async (
    idCat, 
    limit, 
    offset, 
    sortBy, 
    order,
    provider_filter,
    min_price_filter,
    max_price_filter
) => {    
    if(!ALLOWED_SORTBY.includes(sortBy)){
        throw new ThrowError(
            'Ordenamiento incorrecto',
            400,
            'BAD_REQUEST'
        )
    }else if(!ALLOWED_ORDER.includes(order.toUpperCase())){
        throw new ThrowError(
            'Orden incorrecto',
            400,
            'BAD_REQUEST'
        )
    }

    if(provider_filter){
        const regex = /\[.*\]/;

        if(!regex.test(provider_filter)){
            throw new ThrowError(
                'Not valid array provider',
                400,
                'BAD_REQUEST'
            )
        }

        provider_filter = provider_filter.slice(1, -1).split(', ');

        for (const provider of provider_filter){
            const exists = await dbProvider.getProvider(provider)
            if(exists.rowCount === 0){
                throw new ThrowError(
                    `Provider ${provider} not exists`,
                    404,
                    'PROVIDER_NOT_FOUND'
                )
            }
        }
    }

    const regexOnlyNumbers = /^\d+(\.\d{1,2})?$/;

    if((min_price_filter && !regexOnlyNumbers.test(min_price_filter)) || 
        (max_price_filter && !regexOnlyNumbers.test(max_price_filter))
    ){
        throw new ThrowError(
            'Invalid formats filter price',
            400,
            'BAD_REQUEST'
        )
    }

    const previewData = await productCacheService.getProductsByCategory(
        idCat, 
        limit + 1,
        offset,
        provider_filter,
        min_price_filter,
        max_price_filter
    );

    const paginated = previewData.slice(
        offset,
        offset + limit
    );

    paginated.sort((a, b) => {
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

    let filters = {};

    if(provider_filter){
        filters.provider = provider_filter
    }
    if(min_price_filter && max_price_filter){
        filters.min_price = min_price_filter
        filters.max_price = max_price_filter
    }

    return {
        products: paginated,
        meta: {
            limit,
            offset,
            sortBy,
            order,
            filters,
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