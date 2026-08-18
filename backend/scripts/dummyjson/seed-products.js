require('dotenv').config()
const mapDummyJsonProduct = require('../../src/providers/dummyjson/product-mapper')
const { Product, createProduct, createImageProduct, getProduct } = require('../../src/models/product');

const DUMMY_JSON_API = process.env.DUMMYJSON_PRODUCTS_API

const getDummyJsonProducts = async (limit=40) => {
    const urlApi = `${DUMMY_JSON_API}?sortBy=id&limit=${limit}`;

    console.log(
        `Obteniendo ${limit} productos de jsondummy`
    )
    
    const responseData = await fetch(urlApi);    
    const jsonData = await responseData.json();    
    
    return jsonData.products.map(product => mapDummyJsonProduct(product));
}

const saveProducts = async (products) => {
    for(const product of products){
        const productExist = await getProduct(product.productId, product.providerId)

        if(productExist.rowCount === 0){
            console.log(
                `Guardando: ${product.title} - ${product.price} ${product.currency}`
            );
            
            const newProduct = await createProduct(product);
            
            if(Array.isArray(product.images)){
                await product.images.forEach(async (img, index) => {
                    await createImageProduct(newProduct.id, img, index)
                })
            }
        }else{
            console.log(
                `Producto ya existe: ${product.productId} - ${product.title}`
            );
        }
    }
}

const main = async () => {
    try{
        const procucts = await getDummyJsonProducts();
        
        console.log(`Productos obtenidos desde dummyjson ${procucts.length}`)

        await saveProducts(procucts)
    }catch(error){
        console.error("Error ejecutando seed:", error);

        process.exit(1);
    }
}

main()
