const { getProviders } = require('../models/provider');
const dbProduct = require('../models/product');

async function refreshProducts() {
    try{
        const providers = await getProviders();

        const providerPromises =  providers.map(async (provider) => {
            try{
                const providerProducts = 
                    await dbProduct.getLastProductsNotUpdated(provider.name);
                
                //Array id
                const arrayId = providerProducts.map(
                    product => product.product_id
                );

                return await provider.module.getProductsByIds(arrayId);
            }catch(error){
                console.error(
                    `Error actualizando proveedor ${provider.name}:`,
                    error
                );

                return [];
            }
        })

        const results = await Promise.all(providerPromises);
        
        for(const productsProvider of results){
            for (const objProduct  of productsProvider){

                const updatedProd = await dbProduct.providerUpdateProduct(
                    objProduct.productId, 
                    objProduct.providerId,
                    objProduct
                );

                console.log(
                    `Actualizando: ${objProduct.productId} - ${objProduct.title} - ${objProduct.providerId}`
                );
            }
        }
        console.log('JOB refresh_product terminado')

    }catch(error){
        console.error(error);
    }
}

refreshProducts();