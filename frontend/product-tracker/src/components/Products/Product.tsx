'use client'

import { type ItemProduct } from "@/src/services/products"
import Image from "next/image";

type ItemProductProps = {
    product: ItemProduct
}

export default function Product({product}: ItemProductProps){
    const thubnailImage = product.thumbnail;
    const shimmerB64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZThlOGU4Ii8+PC9zdmc+"

    return(
    <>
        <div className="w-full max-w-[300px] bg-neutral-primary-soft p-6 border border-default rounded-base shadow-xs">
            <div className="relative mx-auto w-[120px] h-[120px] mb-6"> 
                <Image
                    key={thubnailImage}
                    src={thubnailImage} 
                    alt="product" 
                    fill
                    sizes="120px"
                    priority
                    placeholder="blur"
                    blurDataURL={shimmerB64}   
                    className="rounded-base object-contain"  
                />
            </div>
            <div>
                <a
                    href={`/home/products/${encodeURIComponent(product.provider_id)}/${encodeURIComponent(product.product_id)}`}
                >
                    <h5 className="text-md text-heading font-semibold tracking-tight">{product.title}</h5>
                </a>
                <a 
                    target="_blank"
                    rel="noopener noreferrer"
                    href={product.url} 
                    className="inline-flex font-medium items-center text-fg-brand hover:underline"
                >
                    Ver producto
                    <svg className="w-4 h-4 ms-2 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"/></svg>
                </a>
                <div className="flex items-center justify-between mt-6">
                    <span className="text-md font-extrabold text-heading">{`$ ${product.price} ${product.currency}`}</span>
                </div>
            </div>
        </div>
    </>
    )
}