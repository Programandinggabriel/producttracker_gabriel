const dbCategory = require('../models/category')

const getCategories = async () => {
    const categories = await dbCategory.getCategories();
    return categories;
}

module.exports = {
    getCategories
}