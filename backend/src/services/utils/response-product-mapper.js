function mapPreviewProduct(product){
    return {
        product_id: product.productId,
        provider_id: product.providerId,
        title: product.title,
        price: product.price,
        currency: product.currency,
        url: product.url,
        thumbnail: product.images[0]
    }
}

function mapDetailProduct(product){
    return {
        product_id: product.productId,
        provider_id: product.providerId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        url: product.url,
        images: product.images,
        is_favorite: product.isFavorite
    }
}

module.exports = {
    mapDetailProduct,
    mapPreviewProduct
}