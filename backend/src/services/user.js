const dbUser = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ThrowError } = require("../errors/AppError");
const dbProduct = require('../models/product')
const dbProvider = require('../models/provider')
const dbProductPriceAlert = require('../models/product-price-alerts')
const utilsExternalProduct = require('./utils/external-products')

require('dotenv').config();

const login = async (username, password) => {
    // Implement login logic here
    const user = await dbUser.findUserByUsername(username);
    
    if (!user) {
        throw new ThrowError(
            "User not found", 
            404, 
            "USER_NOT_FOUND", 
            {
                username: username
            }
        )
    }

    const isPassordValid = await bcrypt.compare(password, user.password);
    if (!isPassordValid) {
        throw new ThrowError(
            'Invalid credentials', 
            401, 
            'UNAUTHORIZED'
        )
    }

    // Generate a token or session for the user (this is just a placeholder)
    const token = jwt.sign(
        {
            id: user.id, 
            username: user.username
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
    return users;
}

const createUser = async (user) => {
    if (!user.name || !user.email || !user.password || !user.username) {
        throw new ThrowError(
            "Missing required fields: name, email, password, username", 
            400, 
            "BAD_REQUEST"
        );
    }

    const newUser = await dbUser.createDbUser(user);
    return newUser;
}

const updateUser = async (id, user) => {
    if (!user.name || !user.email || !user.username) {
        throw new ThrowError(
            "Missing required fields: name, email, username", 
            400, 
            "BAD_REQUEST"
        );
    }
    
    const updatedUser = await dbUser.updateDbUser(id, user);
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
            404,
            "USER_NOT_FOUND",
            {
                email: email
            }
        )
    }

    const resetUserPassword = await dbUser.resetDbUserPassword(email, newPassword);
   
    return resetUserPassword;
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
            404,
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
            400,
            "BAD_REQUEST",
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
            404,
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

    return external_product;
}

const getProductFavorite = async (idUser) => {
    const allUserFavorites = await dbUser.getDbUserProductsFavorites(idUser);
    const productsFavorite = await Promise.all(
        allUserFavorites.map(async (product) => {
            const arrayImages = await dbProduct.getExternalProductImages(product.id);
            
            return {
                ...product,
                images: arrayImages.map(img => img.image)
            }
        })
    )

    return productsFavorite
}

const deleteProductFavorite = async (idUser, idProd) => {
    const existsFav = await dbUser.getDbFavorite(idUser, idProd);

    if(!existsFav){
        throw new ThrowError(
            "Product favorite doesnt exists", 
            404,
            "PRODUCT_NOT_FOUND",
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
            const product = await dbProduct.getExternalProductById(
                uAlert.product_id
            );

            return {
                alert: {
                    ...uAlert,
                    product: product
                }
            }
        })
    );

    return productAlerts
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
            404,
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
            400,
            "BAD_REQUEST",
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
            404,
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
    createUser, 
    updateUser,
    deleteUser,
    resetPassword,
    createProductFavorite,
    getProductFavorite,
    deleteProductFavorite,
    getPriceAlerts,
    createPriceAlert,
    updatePriceAlert,
    deletePriceAlert
}