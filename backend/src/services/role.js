const dbRoles = require('../models/role')

const getRoles = async() => {
    const roles = await dbRoles.getRoles();
    
    return roles
}

module.exports = {
    getRoles
}