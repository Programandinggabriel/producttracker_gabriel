const auth = require('../middleware/auth')
const permission = require('../middleware/role-required')
const controllers = require('../controllers/provider')
const router = require('express').Router()

router.get("", auth, permission('provider:get'), controllers.getProviders)

module.exports = router
