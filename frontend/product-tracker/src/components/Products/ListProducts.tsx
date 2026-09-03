'use client'

import { Provider, type ItemProduct } from "@/src/services/products"
import Product from "./Product";
import { useState } from "react";
import ProductLoading from "./ProductLoading";

type ListProductsProps = {
    products: ItemProduct[];
    providers: Provider[];
    isLoading: Boolean;
}

export default function ListProducts({ products, providers, isLoading }:ListProductsProps){
    const [cardsLoadingQty, setCardsLoadingQty] = useState(20);
    
    const getProductProvider = (product: ItemProduct) => {
        const provider = 
            providers.find(prov => prov.id === product.provider_id) ?? {
                id: '',
                name: '',
                logo: ''
            };

            return provider
    }
    
    return (
        <>
            <div className="p-5 grid grid-cols-2 md:grid-cols-4 gap-3">            
                {isLoading && (
                    Array.from({length: cardsLoadingQty}).map((_, index) => {
                        return (
                            <ProductLoading key={index}/>
                        )
                    })
                    
                )}
                {
                    products.map((product, index) => {
                        const provider = getProductProvider(product);
                        
                        return (
                            <Product 
                                key={index} 
                                product={product} 
                                provider={provider}
                            />
                        )
                    })
                }
            </div>
        </>
    )
}