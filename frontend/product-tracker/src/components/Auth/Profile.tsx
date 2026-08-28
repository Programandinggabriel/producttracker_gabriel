"use client";

import { useEffect, useState } from "react";
import { ProfileData } from "../../types/auth";
import { FormError } from "../../types/form-error";
import Alert from "../Alert";
import { ErrorAlertMap } from "../../types/alert";
import { changePassword, getProfile, updateProfile, UserProfile } from "../../services/auth";

export default function Profile(){
    const [profileWasUpdated, setProfileWasUpdated] = useState(false);
    const [passwordWasChanged, setPasswordWasChanged] = useState(false);
    const [formData, setFormData] = useState<ProfileData>({
        name: "",
        email: "",
        username: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [profileData, setProfileData] = useState<UserProfile>();
    const [formErrors, setFormErrors] = useState<FormError[]>([]);

    useEffect(()=> {
        const getApiProfile = async() => {
            const profile = await getProfile();

            if(profile.success){
                const data = profile.data; 
                
                setProfileData({
                    id: data?.id ?? "",
                    email: data?.email ?? "",
                    name: data?.name ?? "",
                    username: data?.username ?? ""
                })
            }else{
                const status = profile.error?.status;
                alert(`Error ${status} al obtener perfil`)
            }
        }

        getApiProfile()
    }, [])

    useEffect(() => {
        if(!profileData) return;

        setFormData(prev => {
            return {
                ...prev,
                name: profileData.name,
                email: profileData.email,
                username: profileData.username
            }
        })

    }, [profileData])


    async function apiUpdateProfile(data:ProfileData): Promise<boolean> {
        const updated = await updateProfile(formData);
        
        if(!updated.success){
            const status = updated.error?.status;
            const code = updated.error?.data.error.code;

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
                    message: "No pudimos actualizar el perfil"
                })
            }

            return false
        }

        setProfileWasUpdated(true)
        return true
    }

    async function apiChangePassword(oldPassword: String, newPassword: String): Promise<boolean> {
        const changed = await changePassword(oldPassword, newPassword);

        if(!changed.success){
            const status = changed.error?.status;
            const code = changed.error?.data.error.code;

            if(status === 400 && code === 'BAD_REQUEST'){
                addFormError({
                    typeError: "form",
                    field: "any",
                    message: "Fallo al cambiar la contraseña, revisa tu contraseña actual"
                })
            }else if(status === 500){
                addFormError({
                    typeError: "server",
                    field: "any",
                    message: "No pudimos cambiar la contraseña"
                })
            }

            return false
        }

        setPasswordWasChanged(true)
        return true
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

    function resetSuccessStates(){
        setFormErrors([])
        setProfileWasUpdated(false)
        setPasswordWasChanged(false)
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
        
        resetSuccessStates()
        
        let errors: { field: string }[] = [];
        let passwordErrors: { field: string }[] = [];
        
        const keys = Object.keys(formData) as (keyof ProfileData)[];
        const emptyPasswordKeys = [
            'oldPassword',
            'newPassword',
            'confirmPassword'
        ]

        for (const key of keys){
            if(formData[key] === "" && !emptyPasswordKeys.includes(key)){
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

        if(errors.length > 0){
            return;
        }

        const wantsToChangePassword =
              formData.oldPassword !== "" ||
              formData.newPassword !== "" ||
              formData.confirmPassword !== "";

        if(wantsToChangePassword){  
            if(formData.oldPassword === ""){
                passwordErrors.push({field: 'oldPassword'})
                addFormError({
                    typeError: 'required',
                    field: 'oldPassword',
                    message: 'Contraseña anterior es requerida'
                })
            }else if(formData.newPassword === ""){
                passwordErrors.push({field: 'newPassword'})
                addFormError({
                    typeError: 'required',
                    field: 'newPassword',
                    message: 'Nueva contraseña es requerida'
                })
            }else if(formData.confirmPassword === ""){
                passwordErrors.push({field: 'confirmPassword'})
                addFormError({
                    typeError: 'required',
                    field: 'confirmPassword',
                    message: 'Confimrar contraseña es requerido'
                })
            }

            if(formData.newPassword !== formData.confirmPassword){
                passwordErrors.push({field: 'confirmPassword'})
                addFormError({
                    typeError: "notEquals",
                    field: 'confirmPassword',
                    message: `Las contraseñas no coinciden`
                })
            }

            if (passwordErrors.length > 0){
                return;
            }

            const passwordChanges = await apiChangePassword(
                formData.oldPassword, 
                formData.newPassword
            );

            if(!passwordChanges){
                return;
            }
        }

        await apiUpdateProfile(formData);
    }

    return(
        <form onSubmit={(e) => onSubmitRegisterForm(e)} className="mx-auto flex w-full max-w-xl flex-col rounded-xl border border-gray-200 bg-white p-8 shadow-sm gap-3">
            <div>
                <h2 className="text-2x1 font-bold text-gray-900">
                    Actualizar perfil
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
                        value={formData.name}
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
                        value={formData.email}
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
                        value={formData.username}
                        onChange={(e) => handleInputsChange(e)}
                    />
                </div>
            </div>

            <hr className="my-4 border-t-2 border-gray-300"/>
    
            <div>
                <h2 className="text-2x1 font-bold text-gray-900">
                    Cambiar contraseña
                </h2>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col gap-2">
                    <label 
                        htmlFor="oldPassword"
                        className="text-sm font-medium text-gray-700"
                    >
                        Contraseña actual
                    </label>

                    <input
                        id="oldPassword"
                        name="oldPassword"
                        type="password"
                        placeholder="••••••••"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        onChange={(e) => handleInputsChange(e)}
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-gray-700"
                    >
                        Nueva contraseña
                    </label>

                    <input
                        id="newPassword"
                        name="newPassword"
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
                profileWasUpdated 
                    ?<Alert typeAlert="success" message="Perfil actualizado"/>
                    :''
            }
            {
                passwordWasChanged 
                    ?<Alert typeAlert="success" message="Contraseña cambiada"/>
                    :''
            }
            <button
                type="submit"
                className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
                Actualizar
            </button>
        </form>
    )
}