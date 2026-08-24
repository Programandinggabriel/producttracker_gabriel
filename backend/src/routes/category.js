const router = require('express').Router()
const controllers = require('../controllers/category')
const auth = require('../middleware/auth')
const permission = require("../middleware/role-required")

router.get('', auth, permission('category:get'), controllers.getCategories);

module.exports = router;