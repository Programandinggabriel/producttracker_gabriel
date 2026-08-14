const userRoutes = require("./user");
const productRoutes = require("./product");
const categoryRoutes = require("./category");

module.exports = [
    {
        path: "/users",
        router: userRoutes
    },
    {
        path: "/products",
        router: productRoutes
    },
    {
        path: "/categories",
        router: categoryRoutes
    }
]
