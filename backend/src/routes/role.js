const router = require('express').Router()
const controllers = require('../controllers/role')
const auth = require('../middleware/auth')
const permission = require('../middleware/role-required')

router.get('', auth, permission('roles:get'), controllers.getRoles)

module.exports = router