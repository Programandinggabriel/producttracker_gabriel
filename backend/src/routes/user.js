const router = require("express").Router();
const controllers = require("../controllers/user");

//User routes
router.get("/", controllers.getUser);
router.post("/", controllers.createUser);
router.put("/:id", controllers.updateUser);
router.delete("/:id", controllers.deleteUser);
router.post("/login", controllers.login);

// Password reset route
router.patch("/reset-password", controllers.resetPassword);

module.exports = router;