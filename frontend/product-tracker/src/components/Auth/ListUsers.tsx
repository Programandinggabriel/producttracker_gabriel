'use client'

import { useEffect, useState } from "react";
import { getUsers, type User } from "../../services/auth"
import DeleteUser from "./DeleteUser"
import UpdateUser from "./UpdateUser"
import ModalError from "../ModalError";

export default function ListUsers() {
    const [isLoading, setIsLoading] = useState(false);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });
    const [users, setUsers] = useState<User[]>([]);

    useEffect(()=> {
        getApiUsers()
    }, [])
    
    const getApiUsers = async() => {
        setIsLoading(true)
        const apiUsersResponse = await getUsers();
        const arrayUsers = apiUsersResponse.data ?? []
        
        if(apiUsersResponse.success){
            setUsers(arrayUsers)
        }else{
            const status = apiUsersResponse.error?.status;
            const apiError = apiUsersResponse.error?.data.error;
            
            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if (status === 500){
                setIsApiError(true)
            }
        }
        setIsLoading(false)
    };

    const handleDeleteUser = () => {
        getApiUsers()
    }

    const handleDeleteError = (apiError: {code: String, message: String}) => {
        setApiError({
            code: apiError.code,
            message: apiError.message
        })
        setIsApiError(true)
    }

    return (
        <>
        <div role="status" className={`p-5 ${isLoading ? 'animate-pulse' : ''}`}>
            <div className="relative overflow-x-auto bg-neutral-primary-soft shadow-xs rounded-base border border-default mt-5">
                <table className="w-full text-sm text-left rtl:text-right text-body">
                    <thead className="bg-neutral-secondary-soft border-b border-default">
                        <tr>
                            <th scope="col" className="px-6 py-3 font-medium">
                                Nombre
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                Username
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                Roles
                            </th>
                            <th scope="col" className="px-6 py-3 font-medium">
                                Accion
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            users.map((user, index) => {
                                return (
                                    <tr key={index} className="odd:bg-neutral-primary even:bg-neutral-secondary-soft border-b border-default">
                                        <th scope="row" className="px-6 py-4 font-medium text-heading whitespace-nowrap">
                                            {user.name}
                                        </th>
                                        <td className="px-6 py-4">
                                            {user.username}
                                        </td>
                                        <td className="px-6 py-4">
                                            {user.roles.map(role => role.role_name).join(', ')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <UpdateUser id={user.id}/>
                                                <DeleteUser 
                                                    id={user.id} onDeleted={() => handleDeleteUser()}
                                                    onApiError={(apiError) => {handleDeleteError(apiError)}}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ) 
                            })
                        }
                    </tbody>
                </table>
            </div>
            {isApiError 
                ? <ModalError apiError={apiError}/>
                : ''
            }
        </div>
        </>
    )
}