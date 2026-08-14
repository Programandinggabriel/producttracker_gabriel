require("dotenv").config();

const ebayAuth = require("./auth");
const { Product } = require("../../models/product");
const mapEbayProduct = require("./product-mapper");

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

                throw new Error(
                    `Error obteniendo producto ${id}: ${response.status} - ${error}`
                );
            }

            const product = await response.json();

            const mapProduct = mapEbayProduct({
                item: product,
                category: {
                    id: product.categoryId,
                    name: product.categoryPath.split('|')[0]
                }
            })

            return mapProduct

        })
    );

    return product;
};

const getProductsByCategory = async (categoryIds, limit=100) => {
    const token = await ebayAuth.getEbayAccessToken();
    let subLimit = limit;

    if(categoryIds.length > 1){
        subLimit = Math.ceil((limit / categoryIds.length) + 50);
    }

    const arrayProducts = await Promise.all(
        categoryIds.map(async (id) => {
            let products = [];

            const params = new URLSearchParams({
                category_ids: id,
                limit: String(subLimit)
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

                throw new Error(
                    `Error obteniendo producto ${id}: ${response.status} - ${error}`
                );
            }

            const data = await response.json();
            const items = data.itemSummaries || [];

            for (const item of items){
                products.push({
                    item: item,
                    category: {
                        id: id,
                        name: ''
                    }
                })
            }

            return products;
        })
    );

    const allProductsByCategories = arrayProducts.flat();
    const productsSliced = allProductsByCategories.slice(0, limit);
    const mapedProducts = productsSliced.map(mapEbayProduct);
    
    return mapedProducts
}

module.exports = {
    getProductsByIds,
    getProductsByCategory
};