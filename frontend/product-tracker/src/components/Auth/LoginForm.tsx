"use client"

import { useState } from "react"
import { LoginData } from "../../types/auth"
import { FormError } from "../../types/form-error";
import { ErrorAlertMap } from "../../types/alert";
import Alert from "../Alert";
import { loginUser } from "../../services/auth";

export default function LoginForm(){
    const [ loginFormData, setLoginFormData ] = useState<LoginData>({
        username: "",
        password: ""
    });

    const [ formErrors, setFormErrors ] = useState<FormError[]>([])
    
    async function apiLogin(loginForm:LoginData) {
        const login = await loginUser(loginFormData);

        if(!login.success){
            const status = login.error?.status;

            setFormErrors([])
            if(status === 401){
                 setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "form",
                        field: 'any',
                        message: `Usuario o contraseña incorrectos`
                    }
                ])
            }else if(status === 500) {
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "server",
                        field: "any",
                        message: "Error interno"
                    }
                ])
            }
        }else{
            const token = login.data?.token ?? '';
            localStorage.setItem('authToken', token)
            window.location.href = '/home'
        }
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputId = e.target.id;
        const inputValue = e.currentTarget.value;

        setLoginFormData({
            ...loginFormData,
            [inputId]: inputValue
        })
    }


    const onFormSubmmit = async (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault()
        let errors: { field: string }[] = [];
        const keys = Object.keys(loginFormData) as (keyof LoginData)[];

        setFormErrors([])
        for(const key of keys){
            if(loginFormData[key] === ""){
                const label = document.querySelector(`label[for="${key}"]`);
                const htmlLabel = label?.innerHTML;

                errors.push({ field: key })
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "required",
                        field: key,
                        message: `El campo ${htmlLabel} es requerido`
                    }
                ])
            }
        }

        if(errors.length === 0){
            await apiLogin(loginFormData)
        }
    }
    
    return (
        <form onSubmit={(e) => onFormSubmmit(e)} className="mx-auto flex w-full max-w-md flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm gap-3">
            <div>
                <h2 className="text-2x1 text-center font-bold text-gray-900">
                    Iniciar sesion
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Nombre de usuario"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        autoComplete="username"
                        onChange={(e) => handleInputChange(e)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label 
                        htmlFor="password"
                        className="text-sm font-medium text-gray-700"
                    >
                        Contraseña
                    </label>

                    <input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        autoComplete="current-password"
                        onChange={(e) => handleInputChange(e)}
                    />
                </div>
            </div>
            
            {
                formErrors.map((error, index) => {
                    const typeAlert = ErrorAlertMap[error.typeError];
                    const message = error.message;
                    return (
                        <Alert key={index} typeAlert={typeAlert} message={message}/>
                    )
                })
            }

            <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Ingresar
            </button>
            <p className="text-gray-500 text-sm text-center mt-4">¿No tienes cuenta? <a className="text-indigo-700 hover:underline" href="/register">Registrate</a></p>
        </form>
    )
}