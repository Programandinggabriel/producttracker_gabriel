const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const getDbUsers = async () => {
    const query = `SELECT id,
                          name,
                          email,
                          username
                   FROM users`;
    const { rows } = await pool.query(query);
    return rows;
};

const getUserPassword = async(userId) => {
    const query = `SELECT password
                   FROM users
                   WHERE id = $1`;
    const values = [userId];

    const { rows } = await pool.query(query, values);

    return rows[0];
}

const findUserById = async (id) => {
    const query = `SELECT id,
                          name,
                          email,
                          username
                   FROM users
                   WHERE id = $1`;
    const values = [id];

    const { rows } = await pool.query(query, values);

    return rows[0];
};

const findUserByUsername = async (username) => {
    const query = `SELECT id,
                          username
                    FROM users 
                   WHERE username = $1`;
    const values = [username];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

const findUserByEmail = async (email) => {
    const query = `SELECT id, 
                          email 
                    FROM users
                   WHERE email = $1`
    const values = [email]

    const { rows } = await pool.query(query, values);
    return rows[0];
}

const createDbUser = async (user) => {
    const { v4: uuidv4 } = await import('uuid');
    const { name, email, password, username } = user;
    
    const userId = uuidv4().replace(/-/g, '').slice(0, 10);
    const hashedPassword = await hashPassword(password);
    
    const query = `INSERT INTO users (id, name, email, password, username)
                   VALUES ($1, $2, $3, $4, $5)
                   RETURNING id, name, email, username`;

    const values = [userId, name, email, hashedPassword, username];     
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const updateDbUser = async (
    id, 
    name,
    email,
    username
) => {
    const query = `UPDATE users 
                    SET name = $1, email = $2, username = $3
                    WHERE id = $4 
                   RETURNING id, name, email, username`;
    
    const values = [name, email, username, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const deleteDbUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    const values = [id];

    const result = await pool.query(query, values);
    return result.rowCount > 0;
}

const resetDbUserPassword = async (id, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    const query = `UPDATE users
                    SET password = $1
                    WHERE id = $2
                    RETURNING *`;
    const values = [hashedPassword, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const changeDbUserPassword = async (id, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    const query = `UPDATE users
                    SET password = $1
                    WHERE id = $2
                    RETURNING *`;
    const values = [hashedPassword, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}


//Roles
const getUserRoles = async (idUser) => {
    const query = `SELECT users_roles.role_id,
                          roles.name
                    FROM users_roles
                    JOIN roles 
                      ON users_roles.role_id = roles.id
                   WHERE user_id = $1`;
    const values = [idUser];

    const { rows } = await pool.query(query, values);

    return rows
}

const assingUserRole = async (idRole, idUser) => {
    const query = `INSERT INTO users_roles (user_id, role_id)
                   VALUES ($1, $2) RETURNING *`;
    const values = [idUser, idRole];

    const { rows } = await pool.query(query, values);

    return rows[0];
}

const deleteUserRole = async(idRole, idUser) => {
    const query = `DELETE FROM users_roles
                   WHERE user_id = $1
                     AND role_id = $2`;
    const values = [idUser, idRole];

    const { rowCount } = await pool.query(query, values);

    return  rowCount > 0
}

//Favorites
const createDbFavorite = async(idProduct, idUser) => {
    const query = `INSERT INTO users_product_favorite (user_id, product_id)
	               VALUES ($1, $2) RETURNING *`;
    const values = [idUser, idProduct]

    const { rows } = await pool.query(query, values);
    
    return rows[0]
}

const getDbFavorite = async (idUser, idProduct) => {
    const query = `SELECT user_id,
                          product_id
                    FROM users_product_favorite
                   WHERE user_id = $1
                     AND product_id = $2`;
    const values = [idUser, idProduct];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const getDbUserProductFavorite = async(idUser, provider, externalIdProduct) => {
    const query = `SELECT eprods.id
                    FROM users_product_favorite ufav
                   JOIN external_products eprods
                     ON ufav.product_id = eprods.id
                   WHERE ufav.user_id = $1
                     AND eprods.provider_id = $2
                     AND eprods.product_id = $3`;
    const values = [idUser, provider, externalIdProduct];

    const { rows } = await pool.query(query, values);

    return rows[0]
}

const getDbUserProductsFavorites = async (idUser) => {
    const query = `SELECT eprods.id,
                          eprods.provider_id,
                          eprods.product_id,
                          eprods.title,
                          eprods.description,
                          eprods.price,
                          eprods.currency,
                          eprods.url,
                          eprods.stock
                    FROM users_product_favorite ufav
                   JOIN external_products eprods
                     ON ufav.product_id = eprods.id
                   WHERE ufav.user_id = $1`;
    
    const values = [idUser]
    const { rows } = await pool.query(query, values)

    return rows
}

const deleteDbFavorite = async (idUser, idProd) => {
    const query = `DELETE FROM users_product_favorite 
                    WHERE user_id = $1 
                      AND product_id = $2`;
    
    const values = [idUser, idProd];

    const result = await pool.query(query, values);
    return result.rowCount > 0;
}

module.exports = {
    getDbUsers,
    getUserPassword,
    findUserById,
    findUserByUsername,
    findUserByEmail,
    createDbUser,
    updateDbUser,
    deleteDbUser,
    resetDbUserPassword,
    changeDbUserPassword,
    getUserRoles,
    assingUserRole,
    deleteUserRole,
    createDbFavorite,
    getDbFavorite,
    getDbUserProductFavorite,
    getDbUserProductsFavorites,
    deleteDbFavorite
}