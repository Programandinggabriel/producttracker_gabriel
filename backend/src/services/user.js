const dbUser = require("../models/user");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const login = async (username, password) => {
    // Implement login logic here
    const user = await dbUser.findUserByUsername(username);
    if (!user) {
        throw new Error("User not found");
    }

    try{
        const isPassordValid = await bcrypt.compare(password, user.password);
        if (!isPassordValid) {
            throw new Error("Invalid password");
        }

        // Generate a token or session for the user (this is just a placeholder)
        const token = jwt.sign(
            {id: user.id, username: user.username}, 
            process.env.JWT_SECRET, 
            {expiresIn: '1h'}
        );
        return token;
    }catch(error){
        throw new Error("Error validating password");
    }
}


const getUser = async () => {
    const users = await dbUser.getDbUsers();
    return users;
}

const createUser = async (user) => {
    if (!user.name || !user.email || !user.password || !user.username) {
        throw new Error("Missing required fields: name, email, password, username");
    }

    const newUser = await dbUser.createDbUser(user);
    return newUser;
}

const updateUser = async (id, user) => {
    if (!user.name || !user.email || !user.username) {
        throw new Error("Missing required fields: name, email, username");
    }

    const updatedUser = await dbUser.updateDbUser(id, user);
    return updatedUser;
}

const deleteUser = async (id) => {
    await dbUser.deleteDbUser(id);
}

const resetPassword = async (email, newPassword) => {
    if (!email || !newPassword) {
        throw new Error("Missing required fields: email, newPassword");
    }
    
    const resetUserPassword = await dbUser.resetDbUserPassword(email, newPassword);
    return resetUserPassword;
}

module.exports = {
    login,
    getUser,
    createUser, 
    updateUser,
    deleteUser,
    resetPassword
}