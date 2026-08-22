const logger = require('../config/logger');
const dbAlertActivation = require('../models/price-alert-activation')
const dbProductPriceAlert = require('../models/product-price-alerts')
const dbProductPriceHist = require('../models/product-price-history')
const dbProduct = require('../models/product')
const dbUser = require('../models/user')
const emailService = require('../services/email/email')
const priceAlertTemplate = require('../templates/email/price_alerts')

const sendEmail = async (
    toEmail, 
    subject, 
    htmlContent,
    notifiedsIds
) => {
    try{
        await emailService.sendEmail(
            toEmail,
            subject,
            htmlContent
        )

        for(const id of notifiedsIds){
            await dbAlertActivation.setStatusAlertActivation(
                id,
                'SEND'
            )
            await dbAlertActivation.setNotifiedAtAlertActivation(
                id
            )
        }
    }catch(error){
        for(const id of notifiedsIds){
            await dbAlertActivation.setStatusAlertActivation(
                id,
                'FAILED'
            )
        }
        logger.error(error.message, {
            name: error.name,
            stack: error.stack,
            code: "SEND_EMAIL_ERROR"
        });
    }
}

const main = async () => {
    try{
        const allUsersAlerts = 
            await dbProductPriceAlert.getUsersProductPriceAlerts();
        
        for(const pAlert of allUsersAlerts){
            const user = await dbUser.findUserById(pAlert.user_id);
            
            const userAlerts = pAlert.user_alerts.split(', ');
            
            const notifiedsIds = [];
            const dataForMessage = [];

            for(const uAlert of userAlerts){
                const dbAlert = 
                    await dbProductPriceAlert.getProductPriceAlertById(uAlert);
                
                const product = 
                    await dbProduct.getExternalProductById(dbAlert.product_id)
                
                const alertNotified = 
                    await dbAlertActivation.getAlertActivationByAlertId(
                        dbAlert.id,
                        ['PENDING', 'FAILED']
                    );
                
                if(!alertNotified || alertNotified.length === 0){
                    continue;
                }

                const history = await Promise.all(
                    alertNotified.map( async (notified) => {
                        const change = await dbProductPriceHist.getProductPriceHistoryById(
                            notified.history_id
                        )
                        return change
                    })
                )

                dataForMessage.push({
                    alert: dbAlert,
                    product: product,
                    history: history
                })

                notifiedsIds.push(
                    ...alertNotified.map(notified => notified.id)
                );
            }

            if (dataForMessage.length === 0){
                continue;
            }

            const htlMessage = priceAlertTemplate(
                user,
                dataForMessage
            )
            
            await sendEmail(
                user.email,
                '🔔 Alertas de precios',
                htlMessage,
                notifiedsIds
            )
        }
    }catch(error){
        console.log('Error ejecutando cron price_alert_notifier')
        logger.error(error.message, {
            name: error.name,
            stack: error.stack,

            code: "CRON_PRICE_ALERT_NOTFIER_ERROR"
        });
    }
}

main()