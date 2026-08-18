const categoryService = require('../services/category')

const getCategories = async (req, res) => {
    try {
        const categories = await categoryService.getCategories();
        return res.status(200).json(categories);
    } catch (error) {
        return res.status(500).json({
            message: "Error getting categories",
            error: error.message
        });
    }
};

module.exports = { 
    getCategories
}