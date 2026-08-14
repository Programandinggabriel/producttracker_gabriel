const { ThrowError } = require("../errors/AppError");
const dbProvider = require("../models/provider");
const dbProduct = require('../models/product');
const dbCategory = require('../models/category');
const { cacheProductsByCategory, getCacheProductsByCategory, validateCacheCategory } = require("../redis/product");

//Consume tabla con vista previa
const getProducts = async () => {
    let allProducts = await dbProduct.getProducts()
    
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

const getProductsByCategory = async (idCat) => {
    const providers = await dbProvider.getProviders();

    const providerPromises = providers.map(async (provider) => {
        const providerCategory = await dbCategory.getCategoryProvider(idCat, provider.name);
        const arrayCategoryIds = providerCategory.map((category => category.prov_category_id))

        if(arrayCategoryIds.length > 0){
            const categoryCached = await validateCacheCategory(idCat, provider.name)
            
            if (!categoryCached){
                const results = await provider.module.getProductsByCategory(arrayCategoryIds);
                await cacheProductsByCategory(idCat, results)
            }
            return getCacheProductsByCategory(idCat, provider.name)
        }

        return null;
    })

    const allProducsProvider = await Promise.all(providerPromises);

    const products = allProducsProvider.filter(
        product => product !== null
    ).flat()
    
    return products
}

module.exports = {
    getProducts,
    getProductsByCategory
}