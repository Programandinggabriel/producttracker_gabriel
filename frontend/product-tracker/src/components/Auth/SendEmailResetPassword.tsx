'use client'

import { forgotPassword } from "@/src/services/auth";
import { ErrorAlertMap } from "@/src/types/alert";
import { ForgotPassword } from "@/src/types/auth";
import { FormError } from "@/src/types/form-error";
import { useState } from "react";
import Alert from "../Alert";

export default function SendEmailPassword(){
    const [ emailWasSend, setEmailWasSend] = useState(false);
    const [ isButtonDisabled, setIsButtonDisabled ] = useState(false);
    const [ formData, setFormData ] = useState<ForgotPassword>({
        email: ''
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

    async function sendEmailPasswordApi(formForgotPassword:ForgotPassword) {
        setIsButtonDisabled(true)
        const send = await forgotPassword(formForgotPassword);

        if(!send.success){
            const status = send.error?.status;

            setFormErrors([])
            if(status === 404){
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "form",
                        field: 'email',
                        message: `Email incorrecto`
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
            setEmailWasSend(true)
        }

        setIsButtonDisabled(false)
    }

    const onFormSubmmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        let errors: { field: string }[] = [];
        const keys = Object.keys(formData) as (keyof ForgotPassword)[];

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

        if(errors.length === 0){
            await sendEmailPasswordApi(formData)
        }
    }

    return (
        <>
            <form onSubmit={(e) => onFormSubmmit(e)} className="flex flex-col gap-3 w-full max-w-md p-4 border border-gray-200 bg-white shadow-sm rounded-xl">
                <span className="font-bold text-lg text-center">
                    Restablecer contraseña
                </span>
                <div className="flex flex-col">
                    <label htmlFor="newPassword">Email registrado</label>
                    <input 
                        id="email"
                        name="email"
                        type="email"
                        className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        placeholder="tuemail@dominio.com"
                        onChange={(e) => handleChangeValues(e)}
                        value={formData.email}
                        disabled={isButtonDisabled}
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
                {emailWasSend && (
                    <Alert typeAlert='info' message='Email enviado'/>
                )}
                <button
                    type="submit"
                    className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >Enviar email</button>
                <a className="text-indigo-700 text-center hover:underline" href="/login">Iniciar sesión</a>
            </form>
        </>
    )
}