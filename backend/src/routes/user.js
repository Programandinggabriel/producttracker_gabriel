const router = require("express").Router();
const controllers = require("../controllers/user");
const auth = require("../middleware/auth")

//User routes
router.get("", auth ,controllers.getUser);
router.post("", controllers.createUser);
router.put("/:id", auth, controllers.updateUser);
router.delete("/:id", auth ,controllers.deleteUser);
router.post("/login", controllers.login);

// Password reset route
router.patch("/reset-password", controllers.resetPassword);

//Product favorites
router.post("/favorites/product", auth ,controllers.createProductFavorite)
router.get("/favorites/product", auth, controllers.getProductFavorite)
router.delete("/favorites/product/:idProd", auth, controllers.deleteProductFavorite)

//User Price alerts
router.post("/alerts/price", auth, controllers.createPriceAlert)
router.get("/alerts/price", auth, controllers.getPriceAlerts)
router.put("/alerts/price/:idAlert", auth, controllers.updatePriceAlert)
router.delete("/alerts/price/:idAlert", auth, controllers.deletePriceAlert)

module.exports = router;