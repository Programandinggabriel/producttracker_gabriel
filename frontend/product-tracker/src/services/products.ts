import { AxiosError } from "axios";
import { api, ApiError } from "./axios";

export type ItemProduct = {
    id: string;
    provider_id: string;
    product_id: string;
    title: string;
    description: string;
    price: string;
    currency: string;
    images: string[];
}


export const getProducts = async() => {
    try{
        const { data } = await api.get<Array<ItemProduct>>('/products');
        
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