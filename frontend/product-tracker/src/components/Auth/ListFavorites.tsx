'use client'

import { deleteFavorite, Favorite, getFavorite, type ProductFavorite } from "@/src/services/auth"
import { useEffect, useState } from "react";
import ModalError from "../ModalError";
import Image from "next/image";

export default function ListFavorites () {
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });
    
    const [userFavorites, setUserFavorites] = useState<ProductFavorite[]>([]);

    const getApiUserFavorites = async () => {
        const favorites = await getFavorite();

        if(favorites.success){
            const data = favorites.data ?? [];

            setUserFavorites(data)
        }else{
            const status = favorites.error?.status;
            const apiError = favorites.error?.data.error;
            
            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if (status === 500){
                setIsApiError(true)
            }
        }
    }

    const deleteApiFavorite = async (favorite: Favorite) => {
        const deleted = await deleteFavorite(favorite.provider, favorite.external_id);

        if(deleted.success){
            await getApiUserFavorites()
        }else{
            const status = deleted.error?.status;
            const apiError = deleted?.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 409 && apiError?.code === 'FAVORITE_ALREADY_EXISTS'){
                
            }else if(status === 400 || status === 500){
                setIsApiError(true)
            }
        }
    }

    const handleClickRemoveFavorite = (provider: String, externalId: String) => {
        deleteApiFavorite({
            provider: provider,
            external_id: externalId
        })
    }

    useEffect(() => {
        getApiUserFavorites()
    }, [])
    
    return (
        <>
            <div className="flex flex-col gap-4 mx-auto h-[650] overflow-y-auto p-4">
                {userFavorites.map((favorite, index) => {
                    const alt = `favorite-thumbnail-${favorite.provider_id}-${favorite.product_id}`
                    return (
                        <div
                            key={index}
                            className="bg-neutral-primary-soft block max-w-full w-full md:w-[500px] lg:w-[800px] p-6 border border-default rounded-base shadow-xs hover:bg-neutral-secondary-medium"
                        >
                            <div className="flex flex-row">
                                <div className="relative w-[120px] h-[120px]">
                                    <Image
                                        src={favorite.thumbnail}
                                        alt={alt}
                                        fill
                                        priority
                                        className="rounded-md object-contain"
                                        sizes="120px"
                                    />
                                </div>
                                <div className="p-5">
                                    <a href={`/home/products/${encodeURIComponent(favorite.provider_id)}/${encodeURIComponent(favorite.product_id)}`}>
                                        {favorite.title}
                                    </a>
                                    <p className="mt-3">{`$${favorite.price} ${favorite.currency}`}</p>
                                </div>
                                <div className="ml-auto mt-9">
                                    <svg 
                                        onClick={(e) => handleClickRemoveFavorite(favorite.provider_id, favorite.product_id)}
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        strokeWidth="1.5" 
                                        stroke="currentColor" 
                                        className="size-6"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>
                                </div>
                            </div>                    
                        </div>
                    )
                })}
            </div>
            {isApiError 
                ? <ModalError apiError={apiError} onModalHide={() => setIsApiError(false)}/>
                : ''
            }
        </>
    )
}