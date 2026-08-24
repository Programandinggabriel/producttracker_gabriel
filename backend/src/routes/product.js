const router = require("express").Router();
const controllers = require("../controllers/product");
const auth = require("../middleware/auth");
const permission = require("../middleware/role-required")


// Product routes
router.get("", auth, permission('products:get'), controllers.getProducts);
router.get("/query", auth, permission('products:get'), controllers.queryProducts);
router.get("/category/:idCat", auth, permission('products:get'), controllers.getProductsByCategory);

module.exports = router;