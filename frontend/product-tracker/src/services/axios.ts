import axios from "axios";

export type ApiError = {
    success: Boolean;
    error: {
        code: String;
        message: String;
    }
}

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('authToken');
    
    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }
    
    return config
})

api.interceptors.response.use(
    response => response,
    error => {
        if(error.response?.status === 401){
            if(error.config.url.includes('/login') || error.config.url.includes('/reset-password')){
                return Promise.reject(error)
            }
            console.log(error.config.url.includes('/forgot-password/'), error.config.url)
            localStorage.removeItem('authToken');
            localStorage.removeItem('userRoles');
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)