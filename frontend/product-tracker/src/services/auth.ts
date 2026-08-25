import { AxiosError } from "axios";
import { RegisterData } from "../types/auth";
import { api, ApiError } from "./axios"

type Role = {
    role_id: String;
    role_name: String
}

type NewUser = {
    id: String;
    name: String;
    email: String;
    password: String;
    username: String;
    roles: Array<Role>;
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