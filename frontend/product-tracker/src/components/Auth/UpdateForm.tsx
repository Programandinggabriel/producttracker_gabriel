"use client"

import { getUserById, Role, updateUser, UserGet } from "@/src/services/auth";
import { UpdateData } from "@/src/types/auth";
import { FormError } from "@/src/types/form-error";
import React, { useEffect, useState } from "react";
import Roles from "./Roles";
import { ErrorAlertMap } from "@/src/types/alert";
import Alert from "../Alert";
import ModalError from "../ModalError";

type UpdateProps = {
    id: String;
}

export default function UpdateForm({ id }: UpdateProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });

    const [currentData, setCurrentData] = useState<UserGet>();
    const [formData, setFormData] = useState<UpdateData>({
        name: "",
        email: "",
        username: "",
        roles: []
    });
    const [formErrors, setFormErrors] = useState<FormError[]>([])
    const [userWasUpdated, setUserWasUpdated] = useState(false);

    useEffect(() => {
        const getApiUserById = async (id: String) => {
            setIsLoading(true)
            const currentUser = await getUserById(id);

            if (currentUser.success) {
                const data = currentUser.data;

                if (data) {
                    setCurrentData({
                        id: data.id ?? "",
                        email: data.email ?? "",
                        username: data.username ?? "",
                        name: data.name ?? "",
                        roles: data.roles ?? []
                    });
                }
            }else{
                const status = currentUser.error?.status;
                const apiError = currentUser.error?.data.error;

                setApiError({
                    code: apiError?.code ?? '',
                    message: apiError?.message ?? ''
                })

                if(status === 404){
                    window.location.href = '/error/404'
                }else if(status === 500 || status === 400){
                    setIsApiError(true)
                }
            }
            setIsLoading(false)
        };

        getApiUserById(id);
    }, [id]);

    useEffect(()=> {
        if(!currentData) return;

        setFormData({
            name: currentData?.name,
            email: currentData?.email,
            username: currentData?.username,
            roles: currentData?.roles
        })
    }, [currentData])

    const handleInputChanges = (e:React.ChangeEvent<HTMLInputElement>) => {
        const inputId = e.target.id;
        const inputValue = e.currentTarget.value;

        setFormData({
            ...formData,
            [inputId]: inputValue
        })
    }

    const handleRolesChange = (roles: Role[]) => {
        setFormData(prev => {
            return {
                ...prev,
                roles: roles
            }
        })
    }

    const handleRolesApiError = (apiError: { code: String, message: String }) => {
        setApiError({
            code: apiError?.code ?? '',
            message: apiError?.message ?? ''
        })
        setIsApiError(true)
    }

    const apiUpdateUser = async() =>{
        const updated = await updateUser(id, formData);

        if(!updated.success){
            const status = updated.error?.status;
            const code = updated.error?.data.error.code;
            
            setFormErrors([])
            if(status === 400 && code === 'BAD_REQUEST'){
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "form",
                        field: "any",
                        message: "Revisa bien tus datos"
                    }
                ])
            }else if (status === 500){
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "server",
                        field: "any",
                        message: "No pudimos actualizar el usuario"
                    }
                ])
            }
        }else{
            setUserWasUpdated(true)
        }
    }

    const onSubmitUpdateForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
            e.preventDefault();
            let errors: { field: string }[] = [];
            const keys = Object.keys(formData) as (keyof UpdateData)[];
    
            setFormErrors([])
            for (const key of keys){
                if(formData[key] === ""){
                    const label = document.querySelector(`label[for="${key}"]`);
                    const htmlLabel = label?.innerHTML;
    
                    errors.push({ field: key })
                    setFormErrors((prev) => [
                        ...prev,
                        {
                            typeError: 'required',
                            field: key,
                            message: `El campo ${htmlLabel} no puede estar vacio`
                        }
                    ])
                }
            }

            if(errors.length === 0){
                await apiUpdateUser();
            }
        }
    
    
    return (
    <>
        <div className="ml-[2vw] text-left rounded-xl bg-white p-8">
            <svg onClick={() => window.location.href = '/home/users'} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
            </svg>
        </div>
        
        <form
            onSubmit={(e)=> onSubmitUpdateForm(e)} 
            className={`mx-auto flex w-full max-w-xl flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm gap-3 ${isLoading ? 'animate-pulse' : ''}`}
        >
            <div>
                <h2 className="text-2x1 font-bold text-gray-900">
                    Actualizar usuario
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
                        placeholder="Nombre completo"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={formData?.name}
                        onChange={(e) => handleInputChanges(e)}
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
                        placeholder="email@dominio.com"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        value={formData?.email}
                        onChange={(e) => handleInputChanges(e)}
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
                        placeholder="Nombre de usuario"
                        className="text-fg-disabled bg-disabled rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        readOnly
                        value={formData.username}
                    />
                </div>
            </div>

            <Roles 
                roles={formData.roles}
                onRolesChange={(roles) => (handleRolesChange(roles))}
                onApiError={(apiError) => {handleRolesApiError(apiError)}}
            />

            {
                formErrors.map((error, index) => {
                    const typeAlert = ErrorAlertMap[error.typeError];
                    const message = error.message;

                    return(
                        <Alert key={index} typeAlert={typeAlert}  message={message}/>
                    )
                })
            }
            {
                userWasUpdated 
                    ? <Alert typeAlert='success' message='Usuario actualizado'/>
                    : ''
            }

            <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Actualizar
            </button>`
        </form>
        {isApiError
            ? <ModalError apiError={apiError}/>
            : '' 
        }
    </>
    )
}