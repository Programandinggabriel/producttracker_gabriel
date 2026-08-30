const { pool } = require('../config/db')

const ALLOWED_SORTBY = ['id', 'title', 'price', 'created'];
const ALLOWED_ORDER = ['ASC', 'DESC'];

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

//Products
const getProduct = async (idProd, idProv) => {
    const query = `SELECT id,
                          provider_id as "providerId",
                          product_id as "productId",
                          title,
                          description,
                          price,
                          currency,
                          url
                    FROM products
                   WHERE product_id = $1
                     AND provider_id = $2`;
    const values = [idProd, idProv];

    const { rows } =  await pool.query(query, values)
    
    return rows[0]
}

const getProducts = async (
  limit,
  offset,
  sortBy,
  order,
) => {
  const params = [];

  let query = `SELECT id,
                      product_id as "productId",
                      provider_id as "providerId",
                      title,
                      price,
                      currency,
                      url
                FROM products`;

  if (sortBy && ALLOWED_SORTBY.includes(sortBy)) {
    const safeOrder = ALLOWED_ORDER.includes(order?.toUpperCase())
      ? order.toUpperCase()
      : 'ASC';

    query += ` ORDER BY ${sortBy} ${safeOrder}`;
  }

  if (limit !== undefined) {
    params.push(limit);
    query += ` LIMIT $${params.length}`;
  }

  if (offset !== undefined) {
    params.push(offset);
    query += ` OFFSET $${params.length}`;
  }
  
  const { rows } = await pool.query(query, params);

  return rows;
};

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
    
    const query = `INSERT INTO products(id, provider_id, product_id, 
                               title, description, price, currency, url, 
                               category, aviable, stock)
	               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                   RETURNING *`;
    
    const values = [
        id, product.providerId, product.productId, product.title, product.description,
        product.price, product.currency, product.url, product.category, product.aviable,
        product.stock
    ]

    const { rows } = await pool.query(query, values)
    
    return rows[0]
}

const providerUpdateProduct = async(idProd, idProv, product) => {
    const query = `UPDATE products
                    SET title=$1, description=$2, price=$3, currency=$4, 
                        url=$5, category=$6, aviable=$7, stock=$8, provider_updated_at = NOW()
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

//Products Images
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
                   ORDER BY position ASC`;
    const values = [id]

    const { rows } = await pool.query(query, values)

    return rows
}

//External Products
const getExternalProductById = async (id) => {
     const query = `SELECT id,
                           provider_id as "providerId",
                           product_id as "productId",
                           title,
                           description,
                           price,
                           currency,
                           url              
                      FROM external_products 
                    WHERE id = $1`;
    const values = [id]

    const { rows } = await pool.query(query, values)

    return rows[0]
}

const getExternalProduct = async (idProv, idProd) => {
     const query = `SELECT id,
                           provider_id,
                           product_id,
                           title,
                           description,
                           price,
                           currency,
                           url              
                     FROM external_products 
                    WHERE product_id = $1
                      AND provider_id = $2`;
    const values = [idProd, idProv]

    const { rows, rowCount } = await pool.query(query, values)

    return {
        product: rows[0],
        rowCount: rowCount
    }
}

const getLastExternalProductsNotClaimed = async(limit = 5) => {
    //Mas antiguos primero
    const query = `SELECT
                    id,
                    provider_id,
                    product_id,
                    price,
                    currency,
                    price_change_claimed_at
                FROM external_products
                ORDER BY price_change_claimed_at ASC NULLS FIRST
                LIMIT $1`;
        
    const values = [limit];

    const { rows } = await pool.query(query, values)

    return rows
}

const getExternalProductsPriceChangeClaimedAt = async(providerName) => {
    //Mas antiguos primero
    const query = `SELECT id,
                          provider_id,
                          product_id
                    FROM external_products
                   WHERE price_change_claimed_at > provider_updated_at
                     AND provider_id = $1`;
        
    const values = [providerName];

    const { rows } = await pool.query(query, values)

    return rows
}


const createExternalProduct = async (product) => {
    const { v4: uuidv4 } = await import('uuid');
    const id = uuidv4().replace(/-/g, '').slice(0, 10);

    const query = `INSERT INTO external_products(id, provider_id, product_id,
                                                 title, description, price, currency, url, 
                                                 category, aviable, stock)
	               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                   RETURNING *`;
    const values = [
        id, product.providerId, product.productId, product.title, product.description,
        product.price, product.currency, product.url, product.category, product.aviable,
        product.stock
    ]

    const { rows } = await pool.query(query, values)

    return rows[0]
}

const updateExternalProductPriceChangeClaimedAt = async(id) => {
    const query = `UPDATE external_products
                    SET price_change_claimed_at = NOW()
                   WHERE id = $1
                   RETURNING *`
    const values = [id];

    const { rows } = await pool.query(query, values);
    return rows[0];
}


const providerUpdateExternalProduct = async(idProd, idProv, product) => {
    const query = `UPDATE external_products
                    SET title=$1, description=$2, price=$3, currency=$4, 
                        url=$5, category=$6, aviable=$7, stock=$8, provider_updated_at = NOW()
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


//External Products Images
const getExternalProductImages = async (id) => {
    const query = `SELECT image,
                          position
                   FROM external_products_images
                   WHERE id_product = $1
                   ORDER BY position ASC`
    const values = [id]

    const { rows } = await pool.query(query, values)

    return rows
}

const createImageExternalProduct = async (id, urlImage, position) => {
    const { v4: uuidv4 } = await import('uuid');
    const Imgid = uuidv4().replace(/-/g, '').slice(0, 10);

    const query = `INSERT INTO external_products_images (id, id_product, image, "position")
	               VALUES ($1, $2, $3, $4) 
                   RETURNING *;`
    const values = [Imgid, id, urlImage, position]

    const { rows } = await pool.query(query, values)
    
    return rows[0];
}


module.exports = {
    ALLOWED_ORDER,
    ALLOWED_SORTBY,
    Product,
    getProduct,
    getProducts,
    getLastProductsNotUpdated,
    createProduct,
    providerUpdateProduct,
    createImageProduct,
    getProductImages,
    getExternalProductById,
    getExternalProduct,
    getLastExternalProductsNotClaimed,
    getExternalProductsPriceChangeClaimedAt,
    createExternalProduct,
    updateExternalProductPriceChangeClaimedAt,
    providerUpdateExternalProduct,
    getExternalProductImages,
    createImageExternalProduct
};