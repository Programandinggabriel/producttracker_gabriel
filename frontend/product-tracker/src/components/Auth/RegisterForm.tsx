"use client";

import { useState } from "react";
import { RegisterData } from "../../types/auth";
import { FormError } from "../../types/form-error";
import Alert from "../Alert";
import { ErrorAlertMap } from "../../types/alert";
import { createUser } from "../../services/auth";

export default function RegisterForm(){
    const [userWasCreated, setUserWasCreated] = useState(false);
    const [formData, setFormData] = useState<RegisterData>({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        username: ""
    });

    const [formErrors, setFormErrors] = useState<FormError[]>([]);

    async function apiCreateUser(data:RegisterData) {
        const newUser = await createUser(formData);
        
        if(!newUser.success){
            const status = newUser.error?.status;
            const code = newUser.error?.data.error.code;
            
            setFormErrors([])
            if(status === 409 && code === 'USERNAME_ALREADY_EXISTS'){
                addFormError({
                    typeError: "form",
                    field: "username",
                    message: "Ya existe este nombre de usuario"
                })
            }else if(status === 400 && code === 'BAD_REQUEST'){
                addFormError({
                    typeError: "form",
                    field: "any",
                    message: "Revisa bien tus datos"
                })
            }else if(status === 500) {
                addFormError({
                    typeError: "server",
                    field: "any",
                    message: "No pudimos crear el usuario"
                })
            }
        }else{
            setUserWasCreated(true)
            setTimeout(() => {
                window.location.href = '/login'
            }, 2000);
        };
    } 

    function addFormError({ typeError, field, message }:FormError){
        setFormErrors((oldArray) => 
            [
                ...oldArray,
                {
                    typeError: typeError,
                    field: field,
                    message: message
                }
            ]
        )
    }

    const handleInputsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const inputId = e.target.id;
        const inputValue = e.currentTarget.value;
        
        setFormData({
            ...formData,
            [inputId]: inputValue
        });
        
    }

    const onSubmitRegisterForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        let errors: { field: string }[] = [];
        const keys = Object.keys(formData) as (keyof RegisterData)[];

        setFormErrors([]);
        for (const key of keys){
            if(formData[key] === ""){
                const label = document.querySelector(`label[for="${key}"]`);
                const htmlLabel = label?.innerHTML;

                errors.push({ field: key })
                addFormError({
                    typeError: 'required',
                    field: key,
                    message: `El campo ${htmlLabel} no puede estar vacio`
                })
            }
        }

        if(formData.password !== formData.confirmPassword){
            errors.push({ field: 'confirmPassword' })
            setFormErrors((oldArray) => 
                [
                    ...oldArray,
                    {
                        typeError: "required",
                        field: 'confirmPassword',
                        message: `Las contraseñas no coinciden`
                    }
                ]
            )
        }

        if(errors.length === 0){
            await apiCreateUser(formData);
        }
    }

    return(
        <form onSubmit={(e) => onSubmitRegisterForm(e)} className="mx-auto flex w-full max-w-xl flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm gap-3">
            <div>
                <h2 className="text-2x1 font-bold text-gray-900">
                    Crea tu cuenta
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                    <label htmlFor="name">
                        Nombre
                    </label>

                    <input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Tu nombre completo"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(e) => handleInputsChange(e)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="tuemail@dominio.com"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(e) => handleInputsChange(e)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label htmlFor="username">
                        Username
                    </label>

                    <input
                        id="username"
                        name="username"
                        type="text"
                        placeholder="Crea un nombre de usuario"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(e) => handleInputsChange(e)}
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
                        onChange={(e) => handleInputsChange(e)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-gray-700"
                    >
                        Confirmar contraseña
                    </label>

                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(e) => handleInputsChange(e)}
                    />
                </div>
            </div>
            {
                formErrors.map((error, index) => {
                    const typeAlert = ErrorAlertMap[error.typeError];
                    const message = error.message;

                    return (<Alert key={index} typeAlert={typeAlert} message={message} />)
                })
            }
            {
                userWasCreated 
                    ?<Alert typeAlert="success" message="Usuario creado existosamente..."/>
                    :''
            }
            <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Crear cuenta
            </button>
        </form>
    )
}