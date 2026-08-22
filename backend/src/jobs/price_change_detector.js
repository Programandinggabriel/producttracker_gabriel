const dbProductPriceAlert = require('../models/product-price-alerts')
const dbProductPriceHistory = require('../models/product-price-history')
const dbAlertActivation = require('../models/price-alert-activation')
const dbProduct = require('../models/product')
const dbProvider = require('../models/provider')

//Alerts price change
const getPriceChanges = async () => {
    const alerts = await dbProductPriceAlert.getLastPriceAlertsNotClaimed();
    const changes = await Promise.all(
        alerts.map(async (pAlert) => {
            const product1 = await dbProduct.getExternalProductById(
                pAlert.product_id
            );

            const resultProvider = await dbProvider.getProvider(
                product1.provider_id
            );

            const provider = resultProvider.provider;

            const result = await provider.module.getProductsByIds([
                product1.product_id //External id
            ])

            const product2 = result.flat()[0];
            
            const priceChange = detectedPriceChanges(
                pAlert.direction,
                pAlert.target_price,
                product1,
                product2
            );

            return {
                alertId: pAlert.id,
                productId: product1.id,
                direction: pAlert.direction,
                hasChange: priceChange,
                oldPrice: product1.price,
                newPrice: product2.price
            }
        })
    )

    const priceChanges = changes.flat()
    
    return priceChanges
}

const detectedPriceChanges = (
    direction, 
    targetPrice, 
    oldProduct, 
    newProduct
) => {
    const currentPrice = Number(oldProduct.price);
    const newPrice = Number(newProduct.price);
    const target = Number(targetPrice);

    if(
        !Number.isFinite(currentPrice) || 
        !Number.isFinite(newPrice) ||
        !Number.isFinite(target)
    ){
        return false;
    }

    if(direction === 'INCREASE'){
        return currentPrice < target && newPrice >= target;
    }else if (direction === 'DECREASE'){
        return currentPrice > target && newPrice <= target;
    }

    return false
}

const savePriceAlertActivation = async (
    alertId,
    historyId
) => {
    const newActivation = await dbAlertActivation.createAlertActivation(
        alertId,
        historyId
    )
    return newActivation
}

const saveHistoryPriceChange = async (
    idProduct, 
    direction,
    oldPrice, 
    newPrice
) => {
    let history;

    const existsHistory = await dbProductPriceHistory.getProductPriceHistoryByPrices(
        idProduct,
        direction,
        oldPrice,
        newPrice
    );

    if (existsHistory){
        history = existsHistory;
    }else{
        const newHistory = await dbProductPriceHistory.createProductPriceHistory(
            idProduct,
            direction,
            oldPrice, 
            newPrice
        );
        history = newHistory;
    }

    return history
}

const main = async () => {
    const priceChanges = await getPriceChanges();

    for(const change of priceChanges){
        if(change.hasChange){
            const newHistory = await saveHistoryPriceChange(
                change.productId,
                change.direction,
                change.oldPrice,
                change.newPrice
            );
            
            const newActivation = await savePriceAlertActivation(
                change.alertId,
                newHistory.id
            );
        }
       
        await dbProductPriceAlert.updatePriceChangeClamiedAt(
                change.alertId
        )
    }
}

main()