const router = require('express').Router()
const controllers = require('../controllers/category')
const auth = require('../middleware/auth')

router.get('/', auth, controllers.getCategories);

module.exports = router;