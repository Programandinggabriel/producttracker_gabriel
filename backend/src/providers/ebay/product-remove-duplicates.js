function productRemoveDuplicates(products){
    const map = new Map();

    for (const product of products){
        map.set(product.productId, product)
    }

    return [...map.values()]
}

module.exports = productRemoveDuplicates