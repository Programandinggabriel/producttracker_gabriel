const { Product } = require('../../models/product')

function mapDummyJsonProduct(product){
    return new Product({
        productId: product.id,
        providerId: 'dummyjson',
        title: product.title,
        description: product.description,
        price: product.price,
        currency: 'USD',
        images: [
            product.thumbnail,
            ...product.images
        ],
        url: "",
        category: product.category,
        aviable: true,
        stock: product.stock
    });
}

module.exports = mapDummyJsonProduct