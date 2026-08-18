const router = require("express").Router();
const controllers = require("../controllers/product");
const auth = require("../middleware/auth");

// Product routes
router.get("/", auth ,controllers.getProducts);
router.get("/query", auth, controllers.queryProducts);
router.get("/category/:idCat", auth, controllers.getProductsByCategory);

module.exports = router;