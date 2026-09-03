const productService = require('../services/product');

const getProducts = async (req, res, next) => {
    try{
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const sortBy = req.query.sort ?? 'price';
        const order = req.query.order ?? 'asc';

        const products = await productService.getProducts(
            limit,
            offset,
            sortBy,
            order
        );
        return res.status(200).json(products)
    } catch (error) {
        next(error)
    }
}

const queryProducts = async (req, res, next) => {
    try{
        const { q } = req.query
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const sortBy = req.query.sort ?? 'price';
        const order = req.query.order ?? 'asc';

        const products = await productService.getQueryProducts(
            q,
            limit,
            offset,
            sortBy,
            order
        )
        
        return res.status(200).json(products)
    }catch (error){
        next(error)
    }
}


const getProductsByCategory = async (req, res, next) => {
    try{
        const { idCat } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const offset = parseInt(req.query.offset) || 0;
        const sortBy = req.query.sort ?? 'price';
        const order = req.query.order ?? 'asc';

        const products = await productService.getProductsByCategory(
            idCat, 
            limit, 
            offset, 
            sortBy, 
            order
        )

        return res.status(200).json(products)
    }catch(error){
        next(error)
    }

}

const getProductById = async (req, res, next) => {
     try{
        const { provider, externalId } = req.params;
        const userId = req.user.id;

        const product = await productService.getProductById(
            userId,
            provider,
            externalId
        )

        return res.status(200).json(product)
    }catch(error){
        next(error)
    }
}

module.exports = {
    getProducts,
    queryProducts,
    getProductsByCategory,
    getProductById
}