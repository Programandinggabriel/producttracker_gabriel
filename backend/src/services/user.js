const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ThrowError } = require("../errors/AppError");
const dbUser = require("../models/user");
const dbRole = require('../models/role');
const dbProduct = require('../models/product');
const dbProvider = require('../models/provider');
const dbProductPriceAlert = require('../models/product-price-alerts');
const utilsExternalProduct = require('./utils/external-products');
const { mapPreviewProduct, mapDetailProduct } = require('./utils/response-product-mapper');

require('dotenv').config();

const login = async (username, password) => {
    // Implement login logic here
    const user = await dbUser.findUserByUsername(username);

    if (!user) {
        throw new ThrowError(
            'Invalid credentials', 
            401, 
            "UNAUTHORIZED", 
            {
                username: username,
                password: password
            }
        )
    }

    const userHashPass = await dbUser.getUserPassword(user.id);
    const isPassordValid = await bcrypt.compare(password, userHashPass.password);
    if (!isPassordValid) {
        throw new ThrowError(
            'Invalid credentials', 
            401, 
            'UNAUTHORIZED',
            {
                username: username,
                password: password
            }
        )
    }

    const userRoles = await dbUser.getUserRoles(user.id);
    const permissions = await Promise.all(
        userRoles.map(async(role) => {
            const rolePermissions = await dbRole.getRolePermissions(role.role_id);
            
            return {
                ...role,
                permissions: rolePermissions
            }
        })
    )

    const token = jwt.sign(
        {
            id: user.id, 
            username: user.username,
            role_permissions: permissions.flat()
        }, 
        process.env.JWT_SECRET, 
        {
            expiresIn: '1h'
        }
    );
    return token;
}


const getUser = async () => {
    const users = await dbUser.getDbUsers();
    
    const userWithRoles = await Promise.all(
        users.map(async(user) => {
            const roles = await dbUser.getUserRoles(user.id);

            return {
                ...user,
                roles: roles.map(role => {
                    return {
                        role_id: role.role_id,
                        role_name: role.name
                    }
                })
            }
        })
    );

    return userWithRoles.flat();
}

const getUserById = async (id) => {
    const user = await dbUser.findUserById(id);

    if(!user){
        throw new ThrowError(
            "User dont exists", 
            404,
            "USER_NOT_FOUND",
            {
                id: id
            }
        ); 
    }

    const roles = await dbUser.getUserRoles(id);
    const mapRoles = roles.map(role => {
        return {
            role_id: role.role_id,
            role_name: role.name
        }
    })
    
    user.roles = mapRoles

    return user
}

const createUser = async (user) => {
    if (!user.name || !user.email || !user.password || !user.username) {
        throw new ThrowError(
            "Missing required fields: name, email, password, username", 
            400, 
            "BAD_REQUEST"
        );
    }

    let newUser;
    try{
        newUser = await dbUser.createDbUser(user);
    }catch(error){
        if(error.constraint === 'users_username_key'){
            throw new ThrowError(
                "Username already exists", 
                409,
                "USERNAME_ALREADY_EXISTS",
                {
                    username: user.username
                }
            );
        }
    }

    const roleViewer = await dbRole.getRoleByName('viewer');

    await dbUser.assingUserRole(
        roleViewer.id,
        newUser.id
    )

    newUser.roles = [
        {
            role_id: roleViewer.id,
            role_name: roleViewer.name
        }
    ]

    return newUser;
}

const updateUser = async (
    id, 
    name,
    email,
    roles
) => {
    if (!name || !email) {
        throw new ThrowError(
            "Missing required fields: name, email", 
            400, 
            "BAD_REQUEST"
        );
    }

    const existsUser = await dbUser.findUserById(id)

    if(!existsUser){
       throw new ThrowError(
            "User dont exists", 
            404,
            "USER_NOT_FOUND",
            {
                id: id
            }
        ); 
    }
    
    const updatedUser = await dbUser.updateDbUser(
        id,
        name,
        email   
    );

    let userRoles = await dbUser.getUserRoles(id);

    if(roles){
        const setCurrUsrRoles = new Set(userRoles.map(item => item.role_id));
        /*
          const valueString = roles.replace(/[\[\]]/g, '');
          const setRoles =  valueString === '' 
            ? new Set()
            : new Set(valueString.split(',').map(item => item.trim()));
        */
        const setRoles = new Set(roles.map(item => item.trim()))
        const rolesToadd = setRoles.difference(setCurrUsrRoles);
        const rolesToRemove = setCurrUsrRoles.difference(setRoles); 
        
        for(const role of rolesToadd){
            const existRole = await dbRole.getRoleById(role);
            
            if(!existRole){
                throw new ThrowError(
                    `Role by id ${role} not exists`, 
                    400,
                    "BAD_REQUEST",
                    {
                        id: role
                    }
                );
            }
           
            if(userRoles.map(item => item).includes(role)){
                continue;
            }

            const newUserRole = await dbUser.assingUserRole(
                role,
                id
            );
        }

        for(const role of rolesToRemove){
            const deleted = await dbUser.deleteUserRole(
                role,
                id
            );
        }
    }

    userRoles = await dbUser.getUserRoles(id);

    updatedUser.roles = userRoles.map((item) => {
        return {
            role_id: item.role_id,
            role_name: item.name
        }
    });

    return updatedUser;
}

const deleteUser = async (id) => {
    const result = await dbUser.deleteDbUser(id);
    if(!result) throw new ThrowError(
        "User not found. The user you are trying to delete does not exist.", 
        404, 
        "USER_NOT_FOUND", 
        {
            id:id
        }
    )

    return result;
}

const resetPassword = async (email, newPassword) => {
    if (!email || !newPassword) {
        throw new ThrowError(
            "Missing required fields: email, newPassword", 
            400, 
            "BAD_REQUEST"
        );
    }
    
    const user = await dbUser.findUserByEmail(email)

    if(!user){
        throw new ThrowError(
            "User not found. No account is associated with the provided email.",
            422,
            "USER_NOT_FOUND",
            {
                email: email
            }
        )
    }

    const resetUserPassword = await dbUser.resetDbUserPassword(user.id, newPassword);
   
    return resetUserPassword;
}

//User profile
const getUserProfile = async(currentUser) => {
    const profile = dbUser.findUserById(currentUser);

    return profile;
}

const updateUserProfile = async (
    currentUser, 
    name,
    email,
    username
) => {
    if (!name || !email || !username) {
        throw new ThrowError(
            "Missing required fields: name, email, username", 
            400, 
            "BAD_REQUEST"
        );
    }

    let updatedUser;
    try{
        updatedUser = await dbUser.updateDbUserProfile(
            currentUser,
            name,
            email,
            username
        );
    }catch(error){
        if(error.constraint === 'users_username_key'){
            throw new ThrowError(
                "Username already exists", 
                409,
                "USERNAME_ALREADY_EXISTS",
                {
                    username: username
                }
            );
        }
    }

    return updatedUser;
}

const changePassword = async (
    currentUser,
    oldPassword,
    newPassword
) => {
    const hashUserPass = await dbUser.getUserPassword(currentUser);
    const isPasswordValid = await bcrypt.compare(oldPassword, hashUserPass.password);

    if(!isPasswordValid){
        throw new ThrowError(
            'Current password is incorrect', 
            400,
            'BAD_REQUEST'
        )
    }

    const updatedPassword = dbUser.changeDbUserPassword(currentUser, newPassword);

    return true
}


//Favorites
const createProductFavorite = async (idUser, provider, idProduct) => {
    if(!provider || !idProduct){
          throw new ThrowError(
            "Missing required fields: provider, external_id", 
            400, 
            "BAD_REQUEST"
        );
    }

    const resultProvider = await dbProvider.getProvider(provider);

    if(resultProvider.rowCount === 0){
        throw new ThrowError(
            "Provider doesnt exist", 
            422,
            "PROVIDER_NOT_FOUND",
            {
                provider: provider
            }
        );
    }

    const objProvider = resultProvider.provider;
    const providerName = resultProvider.provider.name;

    const existsProductFav = await dbUser.getDbUserProductFavorite(
        idUser, 
        providerName,
        idProduct
    );

    if(existsProductFav){
        throw new ThrowError(
            "Product favorite already exists", 
            409,
            "FAVORITE_ALREADY_EXISTS",
            {
                product: existsProductFav.id
            }
        );
    }

    const products = await objProvider.module.getProductsByIds([
        idProduct
    ]);

    const external_product = products.flat()[0];

    if(!external_product){
        throw new ThrowError(
            "Incorrect Product ID", 
            422,
            "PRODUCT_NOT_FOUND",
            {
                product: idProduct
            }
        );
    }

    const newProduct = await utilsExternalProduct.createExternalProduct(
        providerName,
        external_product
    )

    const newProductFav = await dbUser.createDbFavorite(
        newProduct.id,
        idUser
    );

    return {
        id: newProduct.id,
        ...mapPreviewProduct(external_product)
    }
}

const getProductFavorite = async (idUser) => {
    const allUserFavorites = await dbUser.getDbUserProductsFavorites(idUser);
    const productsFavorite = await Promise.all(
        allUserFavorites.map(async (product) => {
            const arrayImages = await dbProduct.getExternalProductImages(product.id);
            
            product.images = arrayImages.map(img => img.image)

            return mapPreviewProduct(product)
        })
    )

    return productsFavorite
}

const deleteProductFavorite = async (
    idUser, 
    providerID,
    externalId
) => {
    if(!providerID || !externalId){
        throw new ThrowError(
            'provider or external id is missing',
            400,
            'BAD_REQUEST'
        )
    }

    const provider = await dbProvider.getProvider(providerID);

    if(provider.rowCount === 0){
        throw new ThrowError(
            'Provider inactive or dont exists',
             422,
            'BAD_REQUEST'
        )
    }

    const externalProduct = await dbProduct.getExternalProduct(
        providerID,
        externalId
    )

    if(externalProduct.rowCount === 0){
        throw new ThrowError(
            'Product id dont exists',
             422,
            'BAD_REQUEST'
        )
    }

    const idProd = externalProduct.product.id;
    const existsFav = await dbUser.getDbFavorite(idUser, idProd);

    if(!existsFav){
        throw new ThrowError(
            "Product favorite doesnt exists", 
            404,
            "FAVORITE_NOT_FOUND",
            {
                product: idProd
            }
        );
    }
    
    const deleted = await dbUser.deleteDbFavorite(idUser, idProd)

    return deleted
}

//Price alerts
const getPriceAlerts = async (
    idUser
) => {
    const userAlerts = await dbProductPriceAlert.getUserPriceAlerts(
        idUser
    )
    const productAlerts = await Promise.all(
        userAlerts.map(async (uAlert) => {
            const productId = uAlert.product_id;
            const product = await dbProduct.getExternalProductById(productId);
            const productImages = await dbProduct.getExternalProductImages(productId);

            product.images = productImages.map(img => img.image)

            return {
                alert: {
                    ...uAlert,
                    product: mapPreviewProduct(product)
                }
            }
        })
    );

    return productAlerts
}

const getPriceAlertById = async (id) => {
    const alert = await dbProductPriceAlert.getProductPriceAlertById(id);

    if(!alert){
        throw new ThrowError(
            "Price alert doesnt exists", 
            404,
            "ALERT_NOT_FOUND",
            {
                alert: id
            }
        );
    }

    const product = await dbProduct.getExternalProductById(alert.product_id);
    const images = await dbProduct.getExternalProductImages(product.id)

    product.images = images.map(img => img.image)

    return {
        alert: {
                ...alert,
                product: mapDetailProduct(product)
        }
    }
}


const createPriceAlert = async (
    idUser, 
    provider, 
    idProduct,
    direction,
    priceTarget
) => {
    if(!provider || !idProduct || !direction || !priceTarget){
        throw new ThrowError(
            "Missing required fields: provider, external_id, direction, price_target", 
            400, 
            "BAD_REQUEST"
        );
    }
    
    const target = Number(priceTarget);

    if(!Number.isFinite(target) || 
        target <= 0 || 
        !/^\d+(\.\d{1,2})?$/.test(String(priceTarget))
    ){
        throw new ThrowError(
            "Invalid value in price_target", 
            400, 
            "BAD_REQUEST"
        );
    }


    direction = direction.toUpperCase()

    if(!dbProductPriceAlert.ALLOWED_DIRECTIONS.includes(direction)){
        throw new ThrowError(
            "Invalid direction",
            400,
            "BAD_REQUEST",
            {
                direction: direction
            }
        );
    }

    const resultProvider = await dbProvider.getProvider(provider);

    if(resultProvider.rowCount === 0){
        throw new ThrowError(
            "Provider doesnt exist", 
            422,
            "PROVIDER_NOT_FOUND",
            {
                provider: provider
            }
        );
    }

    const objProvider = resultProvider.provider;
    const providerName = resultProvider.provider.name;

    const existsPriceAlert = 
        await dbProductPriceAlert.getUserProductPriceAlert(
            idUser,
            direction,
            providerName,
            idProduct
        );

    if(existsPriceAlert){
        throw new ThrowError(
            "Price alert already exists", 
            409,
            "PRICE_ALERT_ALREADY_EXISTS",
            {
                alert: existsPriceAlert.id
            }
        );
    }

    const products = await objProvider.module.getProductsByIds([
        idProduct
    ]);

    const external_product = products.flat()[0];

    if(!external_product){
        throw new ThrowError(
            "Incorrect Product ID", 
            422,
            "PRODUCT_NOT_FOUND",
            {
                product: idProduct
            }
        );
    }

    const currentPrice = Number(external_product.price)

    if(direction === 'INCREASE' && target < currentPrice){
        throw new ThrowError(
            "Incorrect price_target it must be less than the product price ", 
            400,
            "BAD_REQUEST",
            {
                direction: direction,
                target: target,
                current_price: currentPrice
            }
        );
    }else if (direction === 'DECREASE' && target > currentPrice){
        throw new ThrowError(
            "Incorrect price_target it must be higher than the product price ", 
            400,
            "BAD_REQUEST",
            {
                direction: direction,
                target: target,
                current_price: external_product.price
            }
        );
    }

    const newProduct = await utilsExternalProduct.createExternalProduct(
        providerName,
        external_product
    )

    const newPriceAlert = await dbProductPriceAlert.createUserProductPriceAlert(
        idUser,
        newProduct.id,
        priceTarget,
        direction
    )

    return newPriceAlert;
}

const updatePriceAlert = async (
    idUser,
    idAlert,
    priceTarget,
    direction,
    active
) => {
    if(!direction || !priceTarget || !active){
        throw new ThrowError(
            "Missing required fields: direction, price_target, active", 
            400, 
            "BAD_REQUEST"
        );
    }

    const target = Number(priceTarget);

    if(!Number.isFinite(target) || 
        target <= 0 || 
        !/^\d+(\.\d{1,2})?$/.test(String(priceTarget))
    ){
        throw new ThrowError(
            "Invalid value in price_target", 
            400, 
            "BAD_REQUEST"
        );
    }


    direction = direction.toUpperCase()

    if(!dbProductPriceAlert.ALLOWED_DIRECTIONS.includes(direction)){
        throw new ThrowError(
            "Invalid direction",
            400,
            "BAD_REQUEST",
            {
                direction: direction
            }
        );
    }

    const existsAlert = dbProductPriceAlert.getUserPriceAlert(
        idUser, 
        idAlert
    )

    if(!existsAlert){
        throw new ThrowError(
            "Product price alert doesnt exist", 
            404,
            "ALERT_NOT_FOUND",
            {
                idAlert: idAlert 
            }
        );
    }

    const updatedAlert = dbProductPriceAlert.updateUserProductPriceAlert(
        idUser,
        idAlert,
        priceTarget,
        direction,
        active
    )

    return updatedAlert
}

const deletePriceAlert = async (idUser, idAlert) => {
    const existsAlert = dbProductPriceAlert.getUserPriceAlert(
        idUser, 
        idAlert
    )

    if(!existsAlert){
        throw new ThrowError(
            "Product price alert doesnt exist", 
            404,
            "ALERT_NOT_FOUND",
            {
                idAlert: idAlert 
            }
        );
    }

    const alertDeleted = dbProductPriceAlert.deleteUserProductPriceAlert(
        idUser,
        idAlert
    )

    return alertDeleted;
    
}

module.exports = {
    login,
    getUser,
    getUserById,
    createUser, 
    updateUser,
    deleteUser,
    resetPassword,
    getUserProfile,
    updateUserProfile,
    changePassword,
    createProductFavorite,
    getProductFavorite,
    deleteProductFavorite,
    getPriceAlerts,
    getPriceAlertById,
    createPriceAlert,
    updatePriceAlert,
    deletePriceAlert
}