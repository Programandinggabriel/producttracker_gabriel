const { pool } = require('../config/db');
const bcrypt = require('bcrypt');

const hashPassword = async (password) => {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    return hashedPassword;
}

const getDbUsers = async () => {
    const query = 'SELECT * FROM users';
    const { rows } = await pool.query(query);
    return rows;
};

const findUserByUsername = async (username) => {
    const query = 'SELECT * FROM users WHERE username = $1';
    const values = [username];

    const { rows } = await pool.query(query, values);
    return rows[0];
}

const createDbUser = async (user) => {
    const { v4: uuidv4 } = await import('uuid');
    const { name, email, password, username } = user;
    
    const userId = uuidv4().replace(/-/g, '').slice(0, 10);
    const hashedPassword = await hashPassword(password);
    
    const query = `INSERT INTO users (id, name, email, password, username)
                   VALUES ($1, $2, $3, $4, $5) RETURNING *`;

    const values = [userId, name, email, hashedPassword, username];     
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const updateDbUser = async (id, user) => {
    const { name, email, username } = user;
    const query = `UPDATE users 
                    SET name = $1, email = $2, username = $3
                    WHERE id = $4 
                   RETURNING *`;
    
    const values = [name, email, username, id];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

const deleteDbUser = async (id) => {
    const query = 'DELETE FROM users WHERE id = $1';
    const values = [id];
    await pool.query(query, values);
}

const resetDbUserPassword = async (email, newPassword) => {
    const hashedPassword = await hashPassword(newPassword);
    const query = `UPDATE users
                    SET password = $1
                    WHERE email = $2
                    RETURNING *`;
    const values = [hashedPassword, email];
    const { rows } = await pool.query(query, values);
    return rows[0];
}

module.exports = {
    findUserByUsername,
    getDbUsers,
    createDbUser,
    updateDbUser,
    deleteDbUser,
    resetDbUserPassword
}