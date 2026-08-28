const router = require("express").Router();
const controllers = require("../controllers/user");
const auth = require("../middleware/auth")
const permission = require("../middleware/role-required")


//User routes
router.get(
    "", 
    auth,
    permission('user:get'),
    controllers.getUser
);

router.post(
    "",
    controllers.createUser
);

router.post(
    "/login",
    controllers.login
);

router.patch(
    "/reset-password",
    controllers.resetPassword
);

router.get(
    "/profile",
    auth,
    controllers.getUserProfile
)

router.put(
    "/profile",
    auth,
    controllers.updateProfile
)

router.patch(
    "/profile/change-password",
    auth,
    controllers.changePassword
)

router.post(
    "/favorites/product", 
    auth,
    permission('user_favorite:post'),
    controllers.createProductFavorite
)

router.get(
    "/favorites/product",
    auth,
    permission('user_favorite:get'),
    controllers.getProductFavorite
)

router.post(
    "/alerts/price",
    auth,
    permission('user_price_alert:post'),
    controllers.createPriceAlert
)

router.get(
    "/alerts/price", 
    auth,
    permission('user_price_alert:get'),
    controllers.getPriceAlerts
)

router.get(
    "/:id",
    auth,
    permission('user:get'),
    controllers.getUserById
)

router.put(
    "/:id",
    auth, 
    permission('user:put'),
    controllers.updateUser
);

router.delete(
    "/:id",
    auth,
    permission('user:delete'),
    controllers.deleteUser
);

router.delete(
    "/favorites/product/:idProd", 
    auth,
    permission('user_favorite:delete'),
    controllers.deleteProductFavorite
)

router.put(
    "/alerts/price/:idAlert", 
    auth, 
    permission('user_price_alert:put'),
    controllers.updatePriceAlert
)

router.delete(
    "/alerts/price/:idAlert", 
    auth,
    permission('user_price_alert:delete'),
    controllers.deletePriceAlert
)

module.exports = router;