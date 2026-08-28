import { useEffect, useState } from "react";
import { getUsers, type User } from "../../services/auth"
import DeleteUser from "./DeleteUser"
import UpdateUser from "./UpdateUser"

export default function ListUsers() {
    const [users, setUsers] = useState<User[]>([]);
    
    useEffect(()=> {
        getApiUsers()
    }, [])
    
    const getApiUsers = async() => {
        const apiUsersResponse = await getUsers();
        const arrayUsers = apiUsersResponse.data ?? []
        
        if(apiUsersResponse.success){
            setUsers(arrayUsers)
        }else{
            const code = apiUsersResponse.error?.status;

            if (code === 500){
                alert('Error al obtener usuarios')
            }
        }
    };

    const handleDeleteUser = () => {
        getApiUsers()
    }

    return (
        <>
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
                                                <DeleteUser id={user.id} onDeleted={() => handleDeleteUser()}/>
                                            </div>
                                        </td>
                                    </tr>
                                ) 
                            })
                        }
                    </tbody>
                </table>
            </div>
        </>
    )
}