const { pool } = require('../config/db')

class Product {
    constructor({
        productId,
        providerId,
        title,
        description,
        price,
        currency,
        images,
        url,
        category,
        aviable,
        stock
    }) {
        this.productId = productId;
        this.providerId = providerId;
        this.title = title;
        this.description = description;
        this.price = price;
        this.currency = currency;
        this.images = images;
        this.url = url;
        this.category = category;
        this.aviable = aviable;
        this.stock = stock;
    }
}

const getProduct = async (idProd, idProv) => {
    const query = `SELECT * FROM products 
                   WHERE product_id = $1
                     AND provider_id = $2`;
    const values = [idProd, idProv]

    const result =  await pool.query(query, values)
    
    return {
        rows: result.rows,
        rowCount: result.rowCount
    }
}

const getProducts = async () => {
    const query = `SELECT * FROM products
                   ORDER BY price`;
    const { rows } = await pool.query(query)
    
    return rows
}

const getLastProductsNotUpdated = async(providerName, limit = 5) => {
    //Mas antiguos primero
    const query = `SELECT
                    id,
                    provider_id,
                    product_id,
                    provider_updated_at
                FROM products
                WHERE provider_id = $1
                ORDER BY provider_updated_at ASC NULLS FIRST
                LIMIT $2`;
        
    const values = [providerName, limit];

    const { rows } = await pool.query(query, values)

    return rows
}

const createProduct = async (product) => {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4().replace(/-/g, '').slice(0, 10);
    
    const query = `INSERT INTO products(
                id, provider_id, product_id, title, description, 
                price, currency, url, category, aviable, 
                stock
            )
	        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING *;
    `
    const values = [
        id, product.providerId, product.productId, product.title, product.description,
        product.price, product.currency, product.url, product.category, product.aviable,
        product.stock
    ]

    const { rows } = await pool.query(query, values)
    
    return rows[0]
}

const updateProduct = async(idProd, idProv, product) => {
    const query = `UPDATE products
                   SET title=$1, description=$2, price=$3, currency=$4, 
                       url=$5, category=$6, aviable=$7, stock=$8, updated= NOW(),
                       provider_updated_at = NOW()
                    WHERE provider_id = $9
                      AND product_id = $10
                    RETURNING *;`
    const values = [
        product.title, product.description, product.price, product.currency, 
        product.url, product.category, product.aviable, product.stock,
        idProv, idProd    
    ]

    const { rows } = await pool.query(query, values)
    return rows
}

//Images
const createImageProduct = async (id, urlImage, position) => {
    const { v4: uuidv4 } = await import('uuid');
    const Imgid = uuidv4().replace(/-/g, '').slice(0, 10);

    const query = `INSERT INTO products_images (id, id_product, image, "position")
	               VALUES ($1, $2, $3, $4) 
                   RETURNING *;`
    const values = [Imgid, id, urlImage, position]

    const { rows } = await pool.query(query, values)
    
    return rows[0];
}

const getProductImages = async (id) => {
    const query = `SELECT image,
                          position
                   FROM products_images
                   WHERE id_product = $1
                   ORDER BY position ASC`
    const values = [id]

    const { rows } = await pool.query(query, values)

    return rows
}

module.exports = {
    Product,
    getProduct,
    getProducts,
    getLastProductsNotUpdated,
    createProduct,
    updateProduct,
    createImageProduct,
    getProductImages
};