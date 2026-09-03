'use client'

import { useEffect, useState } from "react";
import ListProducts from "./ListProducts";
import QueryCategory from "./QueryCategory";
import { getCategoryProducts, getProducts, getProviders, getQueryProducts, ItemProduct, PaginationMeta, Provider } from "@/src/services/products";
import Pagination from "../Pagination";
import ModalError from "../ModalError";

export default function Manager(){
    const [isLoading, setIsLoading] = useState(false);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });

    type SearchType = 'initial' | 'query' | 'category'

    const [currSearch, setCurrSearch] = useState<SearchType>('initial');
    const [currQuery, setCurrQuery] = useState('');
    const [currCategory, setCurrCategory] = useState('');

    const [currLimit,  setCurrLimit] = useState(20);
    const [currOffset, setCurrOffset] = useState(0);
    
    const [providers, setProviders] = useState<Provider[]>([]);
    const [products, setProducts] = useState<ItemProduct[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    const getApiProviders = async () => {
        const providers = await getProviders();

        if(providers.success){
            const listProviders = providers.data ?? [];

            setProviders(listProviders)
        }else{
            const status = providers.error?.status;
            const apiError = providers.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 500){
                setIsApiError(true)
            }
        }
    }

    const getApiProducts = async() => {
        let products =  null;
        
        setIsLoading(true)
        if(currSearch === 'initial'){
            products = await getProducts(currLimit, currOffset);
        }else if(currSearch === 'query'){
            products = await getQueryProducts(currQuery, currLimit, currOffset)
        }else if (currSearch === 'category'){
            products = await getCategoryProducts(currCategory, currLimit, currOffset)
        }

        if(products?.success){
            const data = products.data?.products || [];
            const paginationMeta = products.data?.meta;
            
            const dataModifiedThumbnail = data.map((product) => {
                return {
                    ...product,
                    thumbnail: modifiedThumbnailProduct(product.provider_id, product.thumbnail)
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
        if(providers.length > 0){
            getApiProducts()
        }
    }, [currSearch, 
        currLimit, 
        currOffset, 
        currQuery, 
        currCategory,
        providers.length
    ])

    useEffect(() => {
        getApiProviders()
    }, [])

    const modifiedThumbnailProduct = (providerId: string, thumbnail: string) => {
        const regularExpresion = /s-l\d+\.(?:jpg|jpeg|png|webp)$/i;
        const provider = providers.find((prov) => prov.id === providerId);

        if(provider?.id === 'ebay'){
            return thumbnail.replace(regularExpresion, 's-l300.jpg')
        }

        return thumbnail
    }

    function handleChangePagination (direction: string){
        if(direction === 'next'){
            setCurrOffset(prev => prev + currLimit)
        }else if(direction === 'previous'){
            setCurrOffset(prev => Math.max(0, prev - currLimit))
        }
    }

    function handleChangeCategory (category: string){
        setCurrSearch('category')
        setCurrCategory(category)
        setCurrLimit(20)
        setCurrOffset(0)
    }

    function handleSendQueryText (query: string){
        setCurrSearch('query')
        setCurrQuery(query)
        setCurrLimit(20)
        setCurrOffset(0)
    }

    return (
        <>
            <QueryCategory 
                onCategoryChange={(category) => {handleChangeCategory(category)}} 
                onSendQueryText={(query) => {handleSendQueryText(query)}}
            />
            <ListProducts 
                products={products} 
                providers={providers}
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