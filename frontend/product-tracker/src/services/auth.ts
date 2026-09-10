import { AxiosError } from "axios";
import {CreatePriceAlert, Favorite, LoginData, ProfileData, RegisterData, UpdateData, UpdatePriceAlert } from "../types/auth";
import { api, ApiError } from "./axios"
import { ItemDetailProduct, ItemProduct } from "./products";

//Preview role
export type Role = {
    role_id: String;
    role_name: String
}

//Full role
export type RoleWithPermissions = {
    id: String;
    name: String;
    permissions: []
}

type NewUser = {
    id: String;
    name: String;
    email: String;
    password: String;
    username: String;
    roles: Array<Role>;
}

export type User = {
    id: String,
    name: String,
    email: String,
    username: String,
    roles: Array<Role>
}

export type UserGet = {
    id: String,
    name: string,
    email: string,
    username: string,
    roles: Array<Role> 
}

export type UserProfile = {
    id: String;
    name: string;
    email: string;
    username: string
}

type UpdatedUser = {
    id: String;
    name: String;
    email: String;
    roles: Array<Role>
}

type Delete = {
    message: String
}

type TokenUser = {
    token: string,
    roles: Role[]
}

export const createUser = async(formData: RegisterData) => {
    try{
        const payload = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            username: formData.username
        }
        
        const { data } = await api.post<NewUser>('/users', payload);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const loginUser = async(formData: LoginData) => {
  try{
        const payload = {
            username: formData.username,
            password: formData.password
        }
        
        const { data } = await api.post<TokenUser>('/users/login', payload);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getUsers = async() => {
    try{
        const { data } = await api.get<User[]>('/users');

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

export const getUserById = async(id:String) => {
    try{
        const { data } = await api.get<UserGet>(`/users/${id}`);

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

export const updateUser = async(id: String, formData: UpdateData) => {
    try{
        const payload = {
            name: formData.name,
            email: formData.email,
            roles: formData.roles.map(role => role.role_id)
        }
        
        const { data } = await api.put<UpdatedUser>(`/users/${id}`, payload);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const deleteUser = async(id: String) => {
    try{
        const { data } = await api.delete<Delete>(`/users/${id}`);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getRoles = async() => {
    try{
        const { data } = await api.get<RoleWithPermissions[]>('/roles');

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

export const getProfile = async() => {
    try{
        const { data } = await api.get<UserProfile>('/users/profile');

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

export const updateProfile = async(formData: ProfileData) => {
     try{
        const payload = {
            name: formData.name,
            email: formData.email,
            username: formData.username
        }

        const { data } = await api.put<UserProfile>('/users/profile', payload);

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

export const changePassword =  async (oldPassword: String, newPassword: String) => {
       try{
        const payload = {
            current_password: oldPassword,
            new_password: newPassword
        }

        const { data } = await api.patch<{message: string}>('/users/profile/change-password', payload);

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

//FAVORITE
export type ProductFavorite = ItemProduct;

export const getFavorite = async() => {
    try{
        const { data } = await api.get<ProductFavorite[]>('/users/favorites/product');
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const createFavorite = async(formData: Favorite) => {
    try{
        const payload = {
            provider: formData.provider,
            external_id: formData.external_id
        }
        
        const { data } = await api.post<ProductFavorite>('/users/favorites/product', payload);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const deleteFavorite = async(provider: String, external_id: String) => {
    try{ 
        const { data } = await api.delete<Delete>(`/users/favorites/product/${provider}/${external_id}`);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

//PRICE ALERTS
export type AlertDirection = string | 'increase' | 'decrease' | null;

export type PriceAlert = {
    id: String;
    user_id: String;
    internal_product_id: String;
    target_price: String;
    direction: String;
    active: boolean;
    product: ItemProduct
}

export type DetailPriceAlert = {
    id: String;
    user_id: String;
    internal_product_id: String;
    target_price: string;
    direction: AlertDirection;
    active: boolean;
    created: String;
    updated: String;
    product: ItemDetailProduct
}

type ResponsePriceAlert = {
    alert: PriceAlert;
}

type ResponseDetailPriceAlert = {
    alert: DetailPriceAlert;
}

export const createPriceAlert = async(formData: CreatePriceAlert) => {
    try{
        const payload = {
            provider: formData.provider,
            external_id: formData.external_id,
            direction: formData.direction,
            price_target: formData.price_target
        }
        
        const { data } = await api.post<ResponsePriceAlert>('/users/alerts/price', payload);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

export const getPriceAlerts = async() => {
    try{
        const { data } = await api.get<ResponsePriceAlert[]>('/users/alerts/price');

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

export const getPriceAlertById = async(id: String) => {
    try{
        const { data } = await api.get<ResponseDetailPriceAlert>(`/users/alerts/price/${id}`);

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


export const updatePriceAlert = async(id: String, formData: UpdatePriceAlert) => {
     try{
        const payload = {
            direction: formData.direction,
            price_target: formData.price_target,
            active: formData.active
        }

        const { data } = await api.put<ResponsePriceAlert>(`/users/alerts/price/${id}`, payload);

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

export const deletePriceAlert = async(id: String) => {
    try{ 
        const { data } = await api.delete<Delete>(`/users/alerts/price/${id}`);
        
        return {
            success: true,
            data
        };
    }catch(error){
        const err = error as AxiosError<ApiError>;
        
        return {
            success: false,
            error: err.response
        }
    }
}

