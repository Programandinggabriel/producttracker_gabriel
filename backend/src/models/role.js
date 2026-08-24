const { pool } = require('../config/db')

const getRoles = async() => {
    const query = `SELECT id,
                          name,
                          permissions,
                          description
                    FROM roles`;
    const { rows } = await pool.query(query);

    return rows
}

const getRoleById = async(id) => {
    const query = `SELECT id,
                          name,
                          permissions,
                          description
                    FROM roles
                    WHERE id = $1`;
    const values = [id];
    const { rows } = await pool.query(query, values);

    return rows[0]
}

const getRoleByName = async(name) => {
    const query = `SELECT id,
                          name,
                          permissions,
                          description
                    FROM roles
                    WHERE name = $1`;
    const values = [name];
    const { rows } = await pool.query(query, values);

    return rows[0]
}

const getRolePermissions = async (id) => {
    const query = `SELECT permissions
                    FROM roles 
                   WHERE id = $1`;
    const values = [id];

    const { rows } = await pool.query(query, values);

    return rows
}


module.exports = {
    getRoles,
    getRoleByName,
    getRoleById,
    getRolePermissions
}