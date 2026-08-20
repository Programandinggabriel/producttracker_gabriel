const dbUser = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ThrowError } = require("../errors/AppError");
const dbProvider = require('../models/provider')
const dbProduct = require('../models/product')


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

    const exists_external_product = await dbProduct.getExternalProduct(
        providerName, 
        idProduct
    );

    let external_product;
    
    if(exists_external_product.rowCount){
        const product = exists_external_product.product
        const arrayImages = await dbProduct.getExternalProductImages(product.id);

        external_product = {
            ...product,
            images: arrayImages.map(img => img.image)
        }
    }else{
        const products = await resultProvider.provider.module.getProductsByIds([
            idProduct
        ]);

        external_product = products.flat()[0];

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

        const newProduct = await dbProduct.createExternalProduct(
            external_product
        );

        if(Array.isArray(external_product.images)){
            const promises = external_product.images.map((img, index) => 
                dbProduct.createImageExternalProduct(
                    newProduct.id,
                    img,
                    index
                )
            );
            await Promise.all(promises)
        }

        external_product = {
            ...external_product,
            id: newProduct.id 
        };
    }   

    const newProductFav = await dbUser.createDbFavorite(
        external_product.id,
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

module.exports = {
    login,
    getUser,
    createUser, 
    updateUser,
    deleteUser,
    resetPassword,
    createProductFavorite,
    getProductFavorite,
    deleteProductFavorite
}