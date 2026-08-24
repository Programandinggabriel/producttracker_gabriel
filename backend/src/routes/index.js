const userRoutes = require("./user");
const roleRouter = require("./role");
const productRoutes = require("./product");
const categoryRoutes = require("./category");

module.exports = [
    {
        path: "/users",
        router: userRoutes
    },
    {
        path: "/roles",
        router: roleRouter
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
