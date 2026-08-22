
const { ThrowError } = require('../../errors/AppError');
const dbProduct = require('../../models/product')

const createExternalProduct = async(provider, product) => {   
    const external_id = product.productId;
    const exists_external_product = await dbProduct.getExternalProduct(
        provider,
        external_id
    );

    let external_product = product;

    if(exists_external_product.rowCount){
        const product = exists_external_product.product
        const arrayImages = await dbProduct.getExternalProductImages(product.id);

        external_product = {
            ...product,
            images: arrayImages.map(img => img.image)
        }
    }else{
        const newProduct = await dbProduct.createExternalProduct(
            external_product
        );

        if(Array.isArray(external_product.images)){
            const promises = external_product.images.map((img, index) => 
                dbProduct.createImageExternalProduct(
                    newProduct.id,
                    img,
                    index
                )
            );
            await Promise.all(promises)
        }

        external_product = {
            ...external_product,
            id: newProduct.id
        }
    }

    return external_product;
}

module.exports = {
    createExternalProduct
}