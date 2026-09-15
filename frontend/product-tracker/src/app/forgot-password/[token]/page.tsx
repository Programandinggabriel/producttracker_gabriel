'use client'

import ResetPassword from "@/src/components/Auth/ResetPassword";
import { useParams } from "next/navigation";

export default function ForgotPassword() {
    const { token } = useParams();
    
    return (
        <>
            <div className="flex justify-center items-center h-screen">
                <ResetPassword token={token?.toString() ?? ""}/>
            </div>
        </>
    )
}