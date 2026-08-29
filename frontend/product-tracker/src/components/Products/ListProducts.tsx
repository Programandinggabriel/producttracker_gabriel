'use client'

import { getProducts, type ItemProduct } from "@/src/services/products"
import { useEffect, useState } from "react"
import Product from "./Product";

export default function ListProducts(){
    const [previewProducts, setPreviewProducts] = useState<ItemProduct[]>([]);
    
    const getApiProducts = async() => {
        const products = await getProducts();
        
        if(products.success){
            const data = products.data || [];
            setPreviewProducts(data)
        }else{
            const status = products.error?.status;

            if(status === 500){
                alert('Error al cargar productos')
            }
        }
    }

    useEffect(()=> {
        getApiProducts()
    }, [])
    
    return (
        <>
            <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">            
                {
                    previewProducts.map((product, index) => {
                        return (
                            <Product key={index} product={product} />
                        )
                    })
                }
            </div>
        </>
    )
}