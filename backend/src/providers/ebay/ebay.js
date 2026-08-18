require("dotenv").config();

const ebayAuth = require("./auth");
const { Product } = require("../../models/product");
const mapEbayProduct = require("./product-mapper");
const { ThrowError } = require("../../errors/AppError");

const EBAY_API_URL = process.env.EBAY_API;
const EBAY_MARKET_PLACE_ID = process.env.EBAY_MARKETPLACE_ID

async function request(url, accessToken) {
    return fetch(
        url,
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKET_PLACE_ID
            }
        }
    );
}

//Funcion para el job
const getProductsByIds = async (arrayIds) => {
    const token = await ebayAuth.getEbayAccessToken();

    const product = await Promise.all(
        arrayIds.map(async (id) => {
            let response = await request(
                `${EBAY_API_URL}/buy/browse/v1/item/${id}`,
                token
            );

            if (response.status === 401) {
                const newToken = await ebayAuth.refreshEbayAccessToken();
                response = await request(
                    `${EBAY_API_URL}/buy/browse/v1/item/${id}`, 
                    newToken
                );
            }

            if (!response.ok) {
                const error = await response.text();

                throw new ThrowError(
                    `Error obteniendo producto por ID`,
                    500,
                    'API_EBAY_ERROR',
                    {
                        product_id: id,
                        api_ebay_status: response.status,
                        api_ebay_error: error
                    }
                )
            }

            const product = await response.json();
            const validateCategory = arrayIds.includes(product.categoryId);

            const mapProduct = mapEbayProduct({
                item: product,
                category: validateCategory ? product.categoryId : null
            })

            return mapProduct

        })
    );

    return product;
};

const queryProducts = async (
    query,
    limit,
    offset
) => {
    const token = await ebayAuth.getEbayAccessToken()
    const params = new URLSearchParams({
        q: query,
        limit: limit,
        offset: offset
    })

    let response = await request(
        `${EBAY_API_URL}/buy/browse/v1/item_summary/search?${params}`,
        token
    )

    if(response.status === 401){
        const newToken = await ebayAuth.refreshEbayAccessToken();
        response  = await request(
            `${EBAY_API_URL}/buy/browse/v1/item_summary/search?${params}`,
            newToken
        );
    }

    if(!response.ok){
        const error = await response.text()

        throw new ThrowError(
            "Error get products by query", 
            500, 
            "API_EBAY_ERROR", 
            {
                query: query,
                api_ebay_status: response.status,
                api_ebay_error: error
            }
        )
    }

    const data = await response.json();
    const items = data.itemSummaries || [];

    const products = items.map((item) => {
        let categoryId = null;
        const ebayLeftCategoriesIds = item?.leafCategoryIds;

        return mapEbayProduct({
            item: item,
            category: ebayLeftCategoriesIds[0]
        })
    })
    
    return products
}


const getProductsByCategory = async (categoryIds, limit, offset) => {
    if(!categoryIds.length){
        return [];
    }

    const token = await ebayAuth.getEbayAccessToken();
    
    const categoryCount = categoryIds.length;

    let baseLimit = Math.floor(limit / categoryCount);
    let remainder = limit % categoryCount;

    const arrayProducts = await Promise.all(
        categoryIds.map(async (id, index) => {
            const subLimit = baseLimit + (index < remainder ? 1 : 0);
            
            if (subLimit === 0){
                return [];
            }

            let products = [];

            const params = new URLSearchParams({
                category_ids: id,
                limit: String(subLimit),
                offset: offset
            });

            let response = await request(
                `${EBAY_API_URL}/buy/browse/v1/item_summary/search?${params}`,
                token
            );
            
            if (response.status === 401) {
                const newToken = await ebayAuth.refreshEbayAccessToken();
                response = await request(
                    `${EBAY_API_URL}/buy/browse/v1/item_summary/search?${params}`, 
                    newToken
                );
            }

            if (!response.ok) {
                const error = await response.text();

                throw new ThrowError(
                    "Error get products by category", 
                    500, 
                    "API_EBAY_ERROR", 
                    {
                        category_id: id,
                        api_ebay_status: response.status,
                        api_ebay_error: error
                    }
                )
            }

            const data = await response.json();
            const items = data.itemSummaries || [];

            for (const item of items){
                let categoryId = null;
                const ebayLeftCategoriesIds = item?.leafCategoryIds || [];
                
                for (const leftId of ebayLeftCategoriesIds){
                    if (categoryIds.includes(leftId)){
                        categoryId = leftId;
                        break;
                    }
                }

                products.push({
                    item: item,
                    category: categoryId
                })
            }

            return products;
        })
    );

    const allProductsByCategories = arrayProducts.flat();
    const mapedProducts = allProductsByCategories.map(mapEbayProduct);
    
    return mapedProducts
}

module.exports = {
    getProductsByIds,
    queryProducts,
    getProductsByCategory
};