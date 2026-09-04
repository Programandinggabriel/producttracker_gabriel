'use client'

import { useEffect, useState } from "react";
import ListProducts from "./ListProducts";
import QueryCategory from "./QueryCategory";
import { getCategoryProducts, getProducts, getQueryProducts,type ItemProduct, PaginationMeta } from "@/src/services/products";
import Pagination from "../Pagination";
import ModalError from "../ModalError";
import { useRouter, useSearchParams } from "next/navigation";

export default function Manager(){
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const search = searchParams.get('search') ?? 'initial';
    const limit = String(searchParams.get('limit') ?? 20);
    const offset = String(searchParams.get('offset') ?? 0);
    const query = searchParams.get('query') ?? '';
    const category = searchParams.get('category') ?? '';

    const [isLoading, setIsLoading] = useState(false);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });
    
    const [products, setProducts] = useState<ItemProduct[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    const getApiProducts = async(
        search: string, 
        limit: number, 
        offset: number, 
        query: string, 
        category: string
    ) => {
        let products =  null;
        
        setIsLoading(true)
        if(search === 'initial'){
            products = await getProducts(limit, offset);
        }else if(search === 'query'){
            products = await getQueryProducts(query, limit, offset)
        }else if (search === 'category'){
            products = await getCategoryProducts(category, limit, offset)
        }

        if(products?.success){
            const data = products.data?.products || [];
            const paginationMeta = products.data?.meta;
            
            const dataModifiedThumbnail = data.map((product) => {
                return {
                    ...product,
                    thumbnail: modifiedThumbnailProduct(product.provider.id, product.thumbnail)
                }
            })

            setProducts(dataModifiedThumbnail)
            setMeta(paginationMeta ?? null)
        }else{
            const status = products?.error?.status;
            const apiError = products?.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 500){
                setIsApiError(true)
            }
        }
        setIsLoading(false)
    }

    useEffect(() => {
        getApiProducts(
            search,
            Number(limit), 
            Number(offset),
            query,
            category
        )
    }, [
        search,
        limit,
        offset,
        query,
        category
    ])

    const modifiedThumbnailProduct = (providerId: String, thumbnail: string) => {
        const regularExpresion = /s-l\d+\.(?:jpg|jpeg|png|webp)$/i;

        if(providerId === 'ebay'){
            if(thumbnail)
                return thumbnail?.replace(regularExpresion, 's-l300.jpg');
        }

        return thumbnail
    }

    function handleChangePagination (direction: string){        
        const params = new URLSearchParams(searchParams.toString());
        const newOffset = 
            direction === 'next'
                ? Number(offset) + Number(limit)
                : Math.max(0, Number(offset) - Number(limit))
        
        params.set('offset', String(newOffset))
        router.push(`?${params.toString()}`)
    }

    function handleChangeCategory(category: string) {
        const params = new URLSearchParams(searchParams.toString());

        params.set('search', 'category');
        params.set('category', category);
        params.delete('query');
        params.set('offset', '0');

        router.push(`?${params.toString()}`);
    }

    function handleSendQueryText (query: string){
        const params = new URLSearchParams(searchParams.toString())

        params.set('search', 'query');
        params.set('query', query);
        params.delete('category');
        params.set('offset', '0');

        router.push(`?${params.toString()}`)
    }

    return (
        <>
            <QueryCategory 
                onCategoryChange={(category) => {handleChangeCategory(category)}} 
                onSendQueryText={(query) => {handleSendQueryText(query)}}
            />
            <ListProducts
                products={products}
                isLoading={isLoading}
            />
            <div className="flex flex-row justify-center mb-6">
                <Pagination 
                    paginateMetaData={meta} 
                    onChangePaginate={(direction) => handleChangePagination(direction)}
                />
            </div>
            {isApiError && (
                <ModalError apiError={apiError} onModalHide={() => setIsApiError(false)}/>
            )}
        </>
    )
}