require("dotenv").config();
const ebayAuth = require('../../src/providers/ebay/auth')
const mapEbayProduct = require('../../src/providers/ebay/product-mapper')
const { Product, createProduct, createImageProduct, getProduct } = require('../../src/models/product')
const { getProviderCategories } = require('../../src/models/provider-category')
const EBAY_API_URL = process.env.EBAY_API;
const EBAY_MARKET_PLACE_ID = process.env.EBAY_MARKETPLACE_ID
const TOTAL_PRODUCTS = 40;


async function  searchEbayProducts(token, categoryId, limit=10) {
    const params = new URLSearchParams({
        category_ids: categoryId,
        limit: String(limit)
    });
    
    async function request(accessToken) {
        const response = await fetch(
            `${EBAY_API_URL}/buy/browse/v1/item_summary/search?${params}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "X-EBAY-C-MARKETPLACE-ID": EBAY_MARKET_PLACE_ID
                }
            }
        );

        return response;
    }

    let response = await request(token);
    let activeToken = token;

    if(response.status === 401){
        activeToken = await ebayAuth.refreshEbayAccessToken();
        response =  await request(activeToken)
    }

    if (!response.ok){
        const error = await response.text();

        throw new Error(
            `Error buscando productos de eBay: ${response.status} - ${error}`
        ); 
    }

    const data = await response.json()

    return {
        data,
        newToken: activeToken
    }
}

async function getProductsFromEbay(token, categories) {
    const products = [];
    let currentToken = token;

    for (const category of categories) {

        if (products.length >= TOTAL_PRODUCTS){
            break;
        }

        const limit = Math.min((TOTAL_PRODUCTS - products.length), 10)

        console.log(
            `Buscando ${limit} productos en categoria ${category.name}`
        );

        const { data, newToken } = await searchEbayProducts(
            currentToken,
            category.id,
            limit,
        );

        currentToken = newToken;
        
        const items = data.itemSummaries || [];

        for (const item of items) {
            if (products.length >= TOTAL_PRODUCTS) {
                break;
            }

            products.push({
                item,
                category: category.id,
            });
        }
    }

    return products;
}

async function saveProducts(products) {
    for (const product of products){
        const productExist = await getProduct(product.productId, product.providerId)
        
        if(productExist.rowCount === 0){
            console.log(
                `Guardando: ${product.title} - ${product.price} ${product.currency}`
            );

            const newProduct = await createProduct(product)
            
            for (const [index, img] of product.images.entries()) {
                await createImageProduct(newProduct.id, img, index);
            }
        }else{
            console.log(
                `Producto ya existe: ${product.productId} - ${product.title}`
            );
        }

    }
}

async function main() {
    try{
        const token = await ebayAuth.getEbayAccessToken();
        const providerCategories = await getProviderCategories('ebay', 4);
        const categories = providerCategories.map(category => {
            return {
                id: category.external_id,
                name: category.name
            }
        })

        const ebayProducts = await getProductsFromEbay(token, categories)

        console.log(
            `Productos obtenidos desde eBay: ${ebayProducts.length}`
        );

        const products = ebayProducts.map(mapEbayProduct);

        await saveProducts(products);
    }catch (error){
        console.error("Error ejecutando seed:", error);

        process.exit(1);
    }
}

main()