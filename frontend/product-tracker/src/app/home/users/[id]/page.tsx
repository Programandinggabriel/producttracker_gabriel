'use client'

import UpdateForm from "@/src/components/Auth/UpdateForm";
import { useParams } from "next/navigation"

export default function UsersId (){
    const { id } = useParams();
    
    return (
    <>
        <UpdateForm id={String(id)}/>
    </>
    )
}