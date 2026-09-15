'use client'

import { resetPassword } from "@/src/services/auth";
import { ErrorAlertMap } from "@/src/types/alert";
import { type ResetPassword } from "@/src/types/auth";
import { FormError } from "@/src/types/form-error";
import { useState } from "react";
import Alert from "../Alert";

type ResetPasswordProps={
    token:String;
}
export default function ResetUserPassword({ token }:ResetPasswordProps){
    const [ tokenUsed, setTokenUsed ] = useState(false);
    const [ passwordWasChange, setPasswordWasChange ] = useState(false);
    const [ formData, setFormData ] = useState<ResetPassword>({
        newPassword: '',
        confirmPassword: ''
    });
    const [ formErrors, setFormErrors ] = useState<FormError[]>([]);

    
    const handleChangeValues =  (e: React.ChangeEvent<HTMLInputElement>) =>{
        const id = e.currentTarget.id;
        const value = e.currentTarget.value;

        setFormData(prev => ({
            ...prev,
            [id]: value
        }))
    }

    async function resetPasswordApi(resetPasswordForm:ResetPassword) {
        const reset = await resetPassword(token, resetPasswordForm.newPassword);

        if(!reset.success){
            const status = reset.error?.status;

            setFormErrors([])
            if(status === 401 || status === 404){
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "form",
                        field: 'any',
                        message: `Token inválido`
                    }
                ])
            }else if (status === 409){
                setTokenUsed(true)
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
            setPasswordWasChange(true)
        }
    }

    const onFormSubmmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        let errors: { field: string }[] = [];
        const keys = Object.keys(formData) as (keyof ResetPassword)[];

        setFormErrors([])
        for(const key of keys){
            if(formData[key] === ""){
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

        if(formData.newPassword !== formData.confirmPassword){
            errors.push({ field: 'confirmPassword' })
            setFormErrors((prev) => [
                ...prev,
                {
                    typeError: "notEquals",
                    field: 'confirmPassword',
                    message: `Las contraseñas no son identicas`
                }
            ])
        }

        if(errors.length === 0){
            await resetPasswordApi(formData)
        }
    }

    return (
        <>
            <form onSubmit={(e) => onFormSubmmit(e)} className="flex flex-col gap-3 w-full max-w-md p-4 border border-gray-200 bg-white shadow-sm rounded-xl">
                <span className="font-bold text-lg text-center">
                    Cambiar contraseña
                </span>
                <div className="flex flex-col">
                    <label htmlFor="newPassword">Nueva contraseña</label>
                    <input 
                        id="newPassword"
                        name="newPassword"
                        type="password"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="••••••••"
                        onChange={(e) => handleChangeValues(e)}
                        value={formData.newPassword}
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="confirmPassword">Confirmar contraseña</label>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="••••••••"
                        onChange={(e) => handleChangeValues(e)}
                        value={formData.confirmPassword}
                    />
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
                {passwordWasChange && (
                    <Alert typeAlert='info' message='La contraseña fue cambiada'/>
                )}
                {tokenUsed && (
                    <Alert typeAlert='warning' message='Ya cambiaste la contraseña'/>
                )}
                <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >Cambiar contraseña</button>
                <a className="text-indigo-700 text-center hover:underline" href="/login">Iniciar sesión</a>
            </form>
        </>
    )
}