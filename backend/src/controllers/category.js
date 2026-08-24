const categoryService = require('../services/category')

const getCategories = async (req, res, next) => {
    try {
        const categories = await categoryService.getCategories();
        return res.status(200).json(categories);
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getCategories
}