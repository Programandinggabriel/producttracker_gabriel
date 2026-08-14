const productService = require('../services/product');

const getProducts = async (req, res, next) => {
    try{
        //const filters = req.query;
        const products = await productService.getProducts();
        return res.status(200).json(products)
    } catch (error) {
        next(error)
    }
}

const getProductsByCategory = async (req, res, next) => {
    try{
        const { idCat } = req.params
        const products = await productService.getProductsByCategory(idCat)

        return res.status(200).json(products)
    }catch(error){
        next(error)
    }

}

module.exports = {
    getProducts,
    getProductsByCategory
}