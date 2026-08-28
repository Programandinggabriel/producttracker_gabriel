import { getRoles, type Role, type RoleWithPermissions } from "@/src/services/auth"
import { useEffect, useState } from "react";

type RolesParams = {
    roles: Array<Role>;
    onRolesChange: (roles: Array<Role>) => void;
}

export default function Roles({ roles, onRolesChange }:RolesParams){
    const [aviableRoles, setAviableRoles] = useState<RoleWithPermissions[]>([]);

    useEffect(() => {
        const getApiRoles = async() => {
            const aviableRoles = await getRoles();
            if(aviableRoles.success){
                const roles = aviableRoles.data ?? [];
                setAviableRoles(roles)
            }else{
                alert('Error al obtener roles disponibles')
            }
        }

        getApiRoles()

    }, [])

    function userHasRole(id: RoleWithPermissions["id"]){
        const find = roles.find((role) => role.role_id === id);
        return !!find
    }

    function findRoleName(id: RoleWithPermissions["id"]){
        const find = aviableRoles.find(role => role.id === id);
        return find?.name
    }

    const handlerCheckboxClick = (
        e: React.ChangeEvent<HTMLInputElement>, 
        id: RoleWithPermissions['id'],
        name: RoleWithPermissions['name']
    ) => {
        const isChecked = e.target.checked;

        if (isChecked) {
            if (!roles.map(role => role.role_id).includes(id)) {
                onRolesChange([
                    ...roles,
                    {
                        role_id: id,
                        role_name: name
                    }
                ]);
            }
        } else {
            onRolesChange(
                roles.filter(role => role.role_id !== id)
            );
        }
    }

    return(
    <>
        <div className="flex w-full justify-between">
            <div>
                <h3 className="mb-4 font-semibold text-heading">Roles</h3>
                <ul className="w-48 select-none text-sm font-medium text-heading bg-neutral-primary-soft border border-default rounded-base" >
                    {roles.map((role, index) => {
                        return (
                            <li key={index} className="w-full border-b border-default rounded-t-lg">
                                <div className="flex items-center ps-3">
                                    <label className="w-full py-3 ms-2 text-sm font-medium text-heading">{findRoleName(role.role_id)}</label>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
            <div>
                <h3 className="mb-4 font-semibold text-heading">Asignar</h3>
                <ul className="w-48 select-none text-sm font-medium text-heading bg-neutral-primary-soft border border-default rounded-base" >
                    {aviableRoles.map((role, index) => {
                        return (
                            <li key={index} className="w-full border-b border-default rounded-t-lg">
                                <div className="flex items-center ps-3">
                                    <input 
                                        id={`role-${role.id}`} 
                                        type="checkbox" 
                                        onChange={(e) => handlerCheckboxClick(e, role.id, role.name)} 
                                        checked={userHasRole(role.id)}
                                        className="w-4 h-4 border border-default-medium rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
                                    />
                                    <label htmlFor="vue-checkbox" className="w-full py-3 ms-2 text-sm font-medium text-heading">{role.name}</label>
                                </div>
                            </li>
                        )
                    })}
                </ul>
            </div>
        </div>        
    </>
    )

}