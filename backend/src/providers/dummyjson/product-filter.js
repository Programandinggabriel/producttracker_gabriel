const filterProducts = (
    products,
    min_price_filter,
    max_price_filter
) => {
    if(min_price_filter && max_price_filter){
        return products.filter((product) => {
            return Number(product.price) >= Number(min_price_filter) &&
                Number(product.price) <= Number(max_price_filter)
        })
    }

    return products
}

module.exports = filterProducts;