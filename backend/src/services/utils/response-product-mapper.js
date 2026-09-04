function mapPreviewProduct(product){
    return {
        product_id: product.productId,
        title: product.title,
        price: product.price,
        currency: product.currency,
        url: product.url,
        thumbnail: product.images[0],
        provider: product.provider
    }
}

function mapDetailProduct(product){
    return {
        product_id: product.productId,
        title: product.title,
        description: product.description,
        price: product.price,
        currency: product.currency,
        url: product.url,
        images: product.images,
        provider: product.provider,
        is_favorite: product.isFavorite
    }
}

module.exports = {
    mapDetailProduct,
    mapPreviewProduct
}