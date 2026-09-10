require('dotenv').config()
const mapDummyJsonProduct = require('../../src/providers/dummyjson/product-mapper')
const { Product, createProduct, createImageProduct, getProduct } = require('../../src/models/product');
const { getProviderCategoriesIn } = require('../../src/models/provider-category');

const DUMMY_JSON_API = process.env.DUMMYJSON_PRODUCTS_API
const TOTAL_PRODUCTS = 40;

const getDummyJsonProducts = async (categories) => {
    const products = [];

    for (const category of categories) {
        if (products.length >= TOTAL_PRODUCTS){
            break;
        }

        const limit = Math.min((TOTAL_PRODUCTS - products.length), 10)

        console.log(
            `Buscando ${limit} productos en categoria ${category.name}`
        );

        const urlApi = `${DUMMY_JSON_API}/category/${category.external_id}?&limit=${limit}`;
        const responseData = await fetch(urlApi);    
        const jsonData = await responseData.json();    
    
        const mapProducts = jsonData.products.map(mapDummyJsonProduct);

        for (const product of mapProducts){
            products.push(product)
        }
    }

    return products;
}

const saveProducts = async (products) => {
    for(const product of products){
        const productExist = await getProduct(product.productId, product.providerId)

        if(!productExist){
            console.log(
                `Guardando: ${product.title} - ${product.price} ${product.currency}`
            );
            
            const newProduct = await createProduct(product);
            
            if(Array.isArray(product.images)){
                const promises = product.images.map((img, index) => 
                    createImageProduct(newProduct.id, img, index)
                )
                
                await Promise.all(promises)
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
        const categories = await getProviderCategoriesIn('dummyjson', [
            'laptops',
            'tablets',
            'smartphones',
            'mobile-accessories'
        ]);

        const procucts = await getDummyJsonProducts(categories);
        
        console.log(`Productos obtenidos desde dummyjson ${procucts.length}`)

        await saveProducts(procucts)
    }catch(error){
        console.error("Error ejecutando seed:", error);

        process.exit(1);
    }
}

main()
