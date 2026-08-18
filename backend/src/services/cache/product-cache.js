const dbProvider = require('../../models/provider');
const dbCategory = require('../../models/category');
const dbProviderCategoryCache = require('../../models/provider-category-cache');
const redisCache = require('../../redis/product');

const CACHE_SIZE = 100;

const getCachedProductsByBlocks = async ({
    limit,
    offset,
    getCache,
    setCache,
    fetchProducts,
    getState,
    canStop,
    onBlockFetched
}) => {
    const requiredEnd = offset + limit;
    const products = [];

    const state = getState
        ? await getState()
        : null;

    for (
        let blockOffset = 0;
        blockOffset < requiredEnd;
        blockOffset += CACHE_SIZE
    ) {
        let blockProducts = null;

        const cached = await getCache(blockOffset);
        
        if (cached.hit) {
            blockProducts = cached.products;
        }

        if (blockProducts === null) {
            if (canStop && canStop(state, blockOffset)) {
                break;
            }

            blockProducts = await fetchProducts(
                CACHE_SIZE,
                blockOffset
            );

            await setCache(
                blockOffset,
                blockProducts
            );

            if (onBlockFetched) {
                await onBlockFetched(
                    blockOffset,
                    blockProducts
                );
            }
        }

        products.push(...blockProducts);

        if (blockProducts.length < CACHE_SIZE) {
            break;
        }
    }

    return products;
};

const getQueryProducts = async (query, limit, offset) => {
    const providers = await dbProvider.getProviders();
    const providerPromises = providers.map(
        (provider) => {
            const products = getCachedProductsByBlocks({
                limit,
                offset,
                
                getCache: (blockOffset) =>
                    redisCache.getCacheQueryProducts(
                        query, 
                        blockOffset
                    ),
                
                setCache: (blockOffset, blockProducts) => 
                    redisCache.cacheProductsQuery(
                        query,
                        blockOffset,
                        blockProducts
                    ),
                
                fetchProducts: (limit, offset) => 
                    provider.module.queryProducts(
                        query,
                        limit,
                        offset
                    )
            })

            return products;
        }
    )

    const results = await Promise.all(providerPromises);

    return results.flat()
}


const getProductsByCategory = async (idCat, limit, offset) => {
    const providers = await dbProvider.getProviders();
    const providerPromises = providers.map(
        async(provider) => {
            const providerCategory = await dbCategory.getCategoryProvider(idCat, provider.name);
            const categoryIds = providerCategory.map(category => category.prov_category_id);
            
            if (!categoryIds.length) {
                return [];
            }

            const products = getCachedProductsByBlocks({
                limit,
                offset,
                
                getCache: (blockOffset) => 
                    redisCache.getCacheProductsByCategory(
                        idCat,
                        provider.name,
                        blockOffset
                    ),
                
                setCache: (blockOffset, blockProducts) => 
                    redisCache.cacheProductsByCategory(
                        idCat,
                        provider.name,
                        blockOffset,
                        blockProducts
                    ),

                fetchProducts: (limit, offset) => 
                    provider.module.getProductsByCategory(
                        categoryIds,
                        limit,
                        offset
                    ),

                getState: () => 
                    dbProviderCategoryCache.getCacheState(
                        idCat,
                        provider.name
                    ),
                
                canStop: (state, blockOffset) => 
                    state && 
                    state.has_more === false &&
                    blockOffset > state.last_provider_offset,
                
                onBlockFetched: (offset, products) => 
                    dbProviderCategoryCache.upsert({
                        categoryId: idCat,
                        providerId: provider.name,
                        hasMore: products.length === CACHE_SIZE,
                        lastProviderOffset: offset
                    })
        
            });

            return products;
        }
    );

    const results = await Promise.all(providerPromises);

    return results.flat()
}



module.exports = {
    getProductsByCategory,
    getQueryProducts
}