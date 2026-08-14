const dbUser = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { ThrowError } = require("../errors/AppError");

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
        {id: user.id, username: user.username}, 
        process.env.JWT_SECRET, 
        {expiresIn: '1h'}
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
const createProductFavorite = async (idProduct, idUser) => {
    if(!idProduct){
          throw new ThrowError(
            "Missing required fields: id product", 
            400, 
            "BAD_REQUEST"
        );
    }
    
    const newFav = await dbUser.createDbFavorite(idProduct, idUser)
    return newFav;
}

const getProductFavorite = async (idUser) => {
    const allUsrFav = await dbUser.getDbFavorite(idUser);
    return allUsrFav
}

module.exports = {
    login,
    getUser,
    createUser, 
    updateUser,
    deleteUser,
    resetPassword,
    createProductFavorite,
    getProductFavorite
}