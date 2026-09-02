'use client'

import { type ItemProduct } from "@/src/services/products"
import Product from "./Product";
import { useState } from "react";
import ProductLoading from "./ProductLoading";

type ListProductsProps = {
    products: ItemProduct[];
    isLoading: Boolean;
}

export default function ListProducts({ products, isLoading }:ListProductsProps){
    const [cardsLoadingQty, setCardsLoadingQty] = useState(20);
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
                        return (
                            <Product key={index} product={product} />
                        )
                    })
                }
            </div>
        </>
    )
}