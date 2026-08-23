const logger = require('../config/logger');
const dbProductPriceHistory = require('../models/product-price-history')
const dbProduct = require('../models/product')
const dbProvider = require('../models/provider')

const getPriceChanges = async () => {
    const products = await dbProduct.getLastExternalProductsNotClaimed();
    const changes = await Promise.all(
        products.map(async (product) => {
            const product1 = product;
            const providerName = product1.provider_id;
            const external_id = product1.product_id;

            const resultProvider = await dbProvider.getProvider(providerName);
            const provider = resultProvider.provider;
            
            const result = await provider.module.getProductsByIds([external_id])
            const product2 = result.flat()[0];

            const currentPrice = Number(product1.price);
            const newPrice = Number(product2.price);
            
            let changeDirection;
            let changeDiff;
            let changePercentage;
            if(Number.isFinite(currentPrice) && Number.isFinite(newPrice)){
                if(currentPrice !== newPrice){
                    if(currentPrice < newPrice){
                        changeDirection = 'INCREASE'
                    }else if(currentPrice > newPrice){
                        changeDirection = 'DECREASE'
                    }

                    changeDiff = (newPrice - currentPrice).toFixed(2)
                    changePercentage = ((Math.abs(changeDiff) / currentPrice) * 100).toFixed(2)
                }
            }

            return {
                productId: product.id,
                hasChange: changeDirection ? true : false,
                direction: changeDirection,
                difference: changeDiff,
                percentage: changePercentage,
                oldPrice: product1.price,
                newPrice: product2.price
            }
        })
    )

    const priceChanges = changes.flat()
    
    return priceChanges
}

const saveHistoryPriceChange = async (
    idProduct, 
    direction,
    difference,
    percentage,
    oldPrice, 
    newPrice
) => {
    const newHistory = await dbProductPriceHistory.createProductPriceHistory(
        idProduct,
        direction,
        difference,
        percentage,
        oldPrice, 
        newPrice
    );
   
    return newHistory
}

const main = async () => {
    try{
        const priceChanges = await getPriceChanges();

        for(const change of priceChanges){
            if(change.hasChange){
                const newHistory = await saveHistoryPriceChange(
                    change.productId,
                    change.direction,
                    change.difference,
                    change.percentage,
                    change.oldPrice,
                    change.newPrice
                );
            }
        
            await dbProduct.updateExternalProductPriceChangeClaimedAt(
                    change.productId
            )
        }
    }catch(error){
        console.log('Error ejecutando job price_change_detector')
        logger.error(error.message, {
            name: error.name,
            stack: error.stack,

            code: "JOB_PRICE_CHANGE_ERROR"
        });
    }
}

main()