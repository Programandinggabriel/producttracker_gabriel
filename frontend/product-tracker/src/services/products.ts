import { AxiosError } from "axios";
import { api, ApiError } from "./axios";

export type ItemProduct = {
    product_id: string;
    title: string;
    price: string;
    currency: string;
    url: string;
    thumbnail: string;
    provider: Provider;
}

export type ItemDetailProduct ={
    product_id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    url: string;
    images: Array<string>;
    provider: Provider;
    is_favorite: boolean;
}

export type PaginationMeta = {
    limit: Number;
    offset: Number;
    sortBy: string;
    order: string;
    hasMore: Boolean;
}

type Response = {
    products: Array<ItemProduct>;
    meta: PaginationMeta
}

export type Provider = {
    id: string;
    logo: string;
    nickname: string;
}


export type Category = {
    id: string;
    name: string;
    slug: string;
}

export const getProductById = async(provider:string, id: string) => {
    try{
        const { data } = await api.get<ItemDetailProduct>(`/products/${provider}/${id}`);
        
        return{
            success: true,
            data
        }
    }catch(error){
        const err = error as AxiosError<ApiError>
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getProducts = async(limit: Number, offset: Number) => {
    try{
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        })
        const { data } = await api.get<Response>(`/products?${params}`);
        
        return{
            success: true,
            data
        }
    }catch(error){
        const err = error as AxiosError<ApiError>
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getQueryProducts = async(query:string, limit: Number, offset: Number) => {
    try{
        const params = new URLSearchParams({
            q: query,
            limit: limit.toString(),
            offset: offset.toString()
        })
        const { data } = await api.get<Response>(`/products/query?${params}`);
        
        return{
            success: true,
            data
        }
    }catch(error){
        const err = error as AxiosError<ApiError>
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getCategoryProducts = async(category:string, limit: Number, offset: Number) => {
    try{
        const params = new URLSearchParams({
            limit: limit.toString(),
            offset: offset.toString()
        })
        const { data } = await api.get<Response>(`/products/category/${category}?${params}`);
        
        return{
            success: true,
            data
        }
    }catch(error){
        const err = error as AxiosError<ApiError>
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getCategories = async() => {
    try{
        const { data } = await api.get<Category[]>(`/categories`);
        
        return{
            success: true,
            data
        }
    }catch(error){
        const err = error as AxiosError<ApiError>
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getProviders = async() => {
    try{
        const { data } = await api.get<Provider[]>(`/providers`);
        
        return{
            success: true,
            data
        }
    }catch(error){
        const err = error as AxiosError<ApiError>
        
        return {
            success: false,
            error: err.response
        }
    }
}
