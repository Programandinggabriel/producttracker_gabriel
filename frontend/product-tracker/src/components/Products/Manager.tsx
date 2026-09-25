'use client'

import { useEffect, useMemo, useState } from "react";
import { getCategoryProducts, getProducts, getQueryProducts,type ItemProduct, PaginationMeta } from "@/src/services/products";
import { useRouter, useSearchParams } from "next/navigation";
import ListProducts from "./ListProducts";
import DataQuery from "./DataQuery";
import Pagination from "../Pagination";
import ModalError from "../ModalError";
import { ApplyValues, type CurrentApplyValues } from "@/src/types/apply_values";

type UrlSearchParams = {
    search: string | 'initial' | 'category' | 'query';
    limit: number;
    offset: number;
    provider: Array<string> | null;
    minPrice: string | null;
    maxPrice: string | null;
    sortBy: string | null;
    order: string | null;
    query: string;
    category: string
}


export default function Manager(){
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const search = searchParams.get('search') ?? 'initial';
    
    const limit = searchParams.get('limit') ?? 20;
    const offset = searchParams.get('offset') ?? 0;
    const provider = searchParams.get('provider') ?? null;
    const minPrice = searchParams.get('minPrice') ?? null;
    const maxPrice = searchParams.get('maxPrice') ?? null;

    const sortBy = searchParams.get('sortBy') ?? null;
    const order = searchParams.get('order') ?? null;

    const query = searchParams.get('query') ?? "";
    const category = searchParams.get('category') ?? "";

    const [urlSearchParams, setUrlSearchParams] = useState<UrlSearchParams | null>(null)

    const [isLoading, setIsLoading] = useState(false);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });
    
    const [products, setProducts] = useState<ItemProduct[]>([]);
    const [meta, setMeta] = useState<PaginationMeta | null>(null);

    const getApiProducts = async() => {
        if(urlSearchParams === null) return;

        let products =  null;

        setIsLoading(true)
        if(urlSearchParams.search === 'initial'){
            products = await getProducts(
                urlSearchParams.provider,
                urlSearchParams.minPrice,
                urlSearchParams.maxPrice,
                urlSearchParams.sortBy,
                urlSearchParams.order,
                urlSearchParams.limit, 
                urlSearchParams.offset
            );
        }else if(urlSearchParams.search === 'query'){
            products = await getQueryProducts(
                urlSearchParams.query,
                urlSearchParams.provider,
                urlSearchParams.minPrice,
                urlSearchParams.maxPrice,
                urlSearchParams.sortBy,
                urlSearchParams.order,
                urlSearchParams.limit, 
                urlSearchParams.offset
            )
        }else if (urlSearchParams.search === 'category'){
            products = await getCategoryProducts(
                urlSearchParams.category, 
                urlSearchParams.provider,
                urlSearchParams.minPrice,
                urlSearchParams.maxPrice,
                urlSearchParams.sortBy,
                urlSearchParams.order,
                urlSearchParams.limit, 
                urlSearchParams.offset
            )
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
        function isValidSearch (search: UrlSearchParams['search']): search is UrlSearchParams['search'] {
            const allowedSearch: Array<UrlSearchParams['search']> = [
                'initial',
                'query',
                'category'
            ]

            return allowedSearch.includes(search)
        }

        const arrayProviders = provider !== null
            ? provider.slice(1 , -1).split(", ")
            : null;

        setUrlSearchParams(prev => ({
            ...prev,
            search: isValidSearch(search) ? search : '',
            limit:  Number(limit),
            offset: Number(offset),
            query: query,
            category: category,
            provider: arrayProviders,
            minPrice: minPrice,
            maxPrice: maxPrice,
            sortBy: sortBy,
            order: order
        }))
    }, [
        search,
        limit,
        offset,
        query,
        category,
        provider,
        minPrice,
        maxPrice,
        sortBy,
        order
    ])

    useEffect(() => {
        if(urlSearchParams){
            getApiProducts()
        }
    }, [urlSearchParams])

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

    function handleClickApply (values: ApplyValues){
        const params = new URLSearchParams(searchParams.toString());
    
        values.filters.forEach(item => {
            if(item.field === 'category'){
                if(item.value === null){
                    params.delete('search', 'category')
                    params.delete('category', category)
                }else{
                    params.delete('query', query)
                    params.set('category', item.value.toString())
                    params.set('search', 'category')
                }
            }
            if(item.field === 'provider'){
                if(item.value === null){
                    if(provider)
                        params.delete('provider', provider)
                }else if(Array.isArray(item.value)){
                    params.set('provider', `[${item.value.join(", ")}]`)
                }
            }
            if(item.field === 'price'){
                if(item.value === null){
                    if (minPrice && maxPrice){
                        params.delete('minPrice', minPrice)
                        params.delete('maxPrice', maxPrice)
                    }
                }else if(typeof(item.value) === 'object' && !Array.isArray(item.value)){
                    params.set('minPrice', item.value.min)
                    params.set('maxPrice', item.value.max)
                }
            }
        })
        
        values.order.forEach(item => {
            if(item.field === 'price'){
                if(item.direction === null){
                    if(order){
                        params.delete('sortBy', 'price')
                        params.delete('order', order)
                    }
                }else{
                    params.set('sortBy', 'price')
                    params.set('order', item.direction)
                }
            }
        })
        
        router.push(`?${params.toString()}`)
    }

    function handleSendQueryText (query: string){
        const params = new URLSearchParams(searchParams.toString())

        params.delete('category', category)
        params.set('search', 'query');
        params.set('query', query);
        params.delete('category');
        params.set('offset', '0');

        router.push(`?${params.toString()}`)
    }

    const normalizeDataFromDataQuery = useMemo(() => {
        const currentData: CurrentApplyValues = {
            filters: [],
            order: []
        }

        if(urlSearchParams){
            if(urlSearchParams.category !== ""){
                currentData.filters.push(
                    {
                        field: 'category',
                        value: urlSearchParams.category
                    }
                )
            }
            if(urlSearchParams.provider){
                currentData.filters.push({
                    field: 'provider',
                    value: urlSearchParams.provider
                })
            }
            if(urlSearchParams.maxPrice && urlSearchParams.minPrice){
                currentData.filters.push({
                    field: 'price',
                    value: {
                        min: urlSearchParams.minPrice,
                        max: urlSearchParams.maxPrice
                    }
                })
            }
            if(urlSearchParams.sortBy && urlSearchParams.order){
                currentData.order.push({
                    field: 'price',
                    direction: urlSearchParams.order
                })
            }
        }

        return currentData;
    }, [urlSearchParams])

    return (
        <>
            <DataQuery
                currentValues={normalizeDataFromDataQuery}
                currentQuery={urlSearchParams?.query ?? ''}
                onApply={(values) => handleClickApply(values)}
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