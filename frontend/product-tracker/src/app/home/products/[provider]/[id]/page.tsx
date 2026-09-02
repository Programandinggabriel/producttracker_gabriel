'use client'

import ProductDetail from "@/src/components/Products/ProductDetail"
import { useParams } from "next/navigation"


export default function ProductById(){
    const params = useParams()
    const provider = decodeURIComponent(String(params.provider))
    const id = decodeURIComponent(String(params.id))

    return (
        <>
            <ProductDetail provider={String(provider)} id={String(id)} />
        </>
    )
}