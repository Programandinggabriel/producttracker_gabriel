const logger = require('../config/logger');
const dbProductPriceAlerts = require('../models/product-price-alerts')
const dbPriceHistory = require('../models/product-price-history')
const dbAlertActivation = require('../models/price-alert-activation')

const getInfoAlerts = async(alerts) => {
    const infoAlerts = await Promise.all(
        alerts.map(async (uAlert) => {
            const allProductPriceHistory = 
                await dbPriceHistory.getProductPriceHistoryByProductId(uAlert.product_id);
            
            return {
                uAlert: uAlert,
                historyPriceChanges: allProductPriceHistory
            }
        })
    )
    
    return infoAlerts.flat();
}

const detectedUserPriceChanges = (
    direction, 
    targetPrice, 
    price1, 
    price2
) => {
    const currentPrice = Number(price1);
    const newPrice = Number(price2);
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

    let alertActivation;
    const existsAlertActivation = 
        await dbAlertActivation.getAlertActivationByAlertAndHistoryId(
            alertId,
            historyId
        )

    if(existsAlertActivation){
        alertActivation = existsAlertActivation;
    }else{
        alertActivation = await dbAlertActivation.createAlertActivation(
            alertId,
            historyId
        )
    }

    return alertActivation
}



const main = async() => {
    try{
        const allUserAlerts = await dbProductPriceAlerts.getAllActiveUserProductsPriceAlerts();
        const productsHistoryChanges = await getInfoAlerts(allUserAlerts);

        for(const change of productsHistoryChanges){
            const userAlert = change.uAlert;
            const priceHistory= change.historyPriceChanges;
            
            const historyAlertActivation = priceHistory.map(
                (history) => {
                    const hasChange = detectedUserPriceChanges(
                        userAlert.direction,
                        userAlert.target_price,
                        history.old_price,
                        history.new_price
                    )
                    
                    return {
                        alertId: userAlert.id,
                        historyId: history.id,
                        hasChange: hasChange
                    }
                }
            )

            for(item of historyAlertActivation){
                if(item.hasChange){
                    const newAlertActivation = 
                        await savePriceAlertActivation(
                            item.alertId,
                            item.historyId
                        )
                }
            }
        }
    }catch(error){
        console.log('Error ejecutando job price_alert_activation')
        logger.error(error.message, {
            name: error.name,
            stack: error.stack,

            code: "JOB_PRICE_ALERT_ACTIVATION_ERROR"
        });
    }
}

main()