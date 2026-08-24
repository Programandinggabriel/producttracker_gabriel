
const rolePermissionRequired = (permissionRequired) => {
    return (req, res, next) => {
        const permSplit = permissionRequired.split(':');
        const nameResource = permSplit[0].toLowerCase();
        const httpPermission = permSplit[1].toUpperCase();

        const userRoles = req.user.role_permissions;

        let hasPermission = false;
        for (const role of userRoles){
            const rolePermissions = role.permissions;
            for(const perm of rolePermissions){
                const objPermissions = perm.permissions;
                if(objPermissions.hasOwnProperty(nameResource)){
                    const httpPerms = objPermissions[nameResource];

                    if(httpPerms.includes(httpPermission)){
                        hasPermission = true
                        break;
                    }
                }
            }

            if(hasPermission) 
                break;
        }

        if(hasPermission){
            next();
        }else{
            res.status(403).json({error: 'You dont have suficient permissions'}); 
        }      
    };
};

module.exports = rolePermissionRequired;