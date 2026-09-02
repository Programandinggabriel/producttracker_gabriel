const userRoutes = require("./user");
const roleRouter = require("./role");
const productRoutes = require("./product");
const categoryRoutes = require("./category");
const providerRoutes = require("./provider")

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
    },
    {
        path: "/providers",
        router: providerRoutes
    }
]
