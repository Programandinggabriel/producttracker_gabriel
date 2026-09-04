'use client'

import { getProductById, type ItemDetailProduct, getProviders } from "@/src/services/products";
import { useEffect, useState } from "react";
import Carousel, { type Image } from "../Carousel";
import ModalError from "../ModalError";
import ProductDetailLoading from "./ProductDetailLoading";
import NextImage from "next/image";
import { createFavorite, deleteFavorite, type Favorite } from "@/src/services/auth";
import ToggleHeart from "./ToggleHeart";

type ProductDetailProps = {
    provider: string;
    id: string;
}

export default function ProductDetail({ provider, id }:ProductDetailProps){
    const [isLoading, setIsLoading] = useState(true);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });
    
    const [product, setProduct] = useState<ItemDetailProduct | null>(null);
    const [images, setImages] = useState<Image[]>([]);

    const [isProductFav, setIsProductFav] = useState<boolean>(false);
    const [isInputFavDisabled, setIsInputFavDisabled] = useState<boolean>(false);

    const getApiDetailProduct = async () => {
        const response = await getProductById(provider, id)
        
        if(response.success){
            const data = response.data;
            const images = data?.images ?? [];

            const imagesModified = modifiedImagesProduct(images)

            setProduct({
                product_id: data?.product_id ?? "",
                title: data?.title ?? "",
                price: data?.price ?? "",
                currency: data?.currency ?? "",
                description: data?.description ?? "",
                url: data?.url ?? "",
                images: imagesModified,
                provider: data?.provider ?? { id: '', logo: '', nickname: '' },
                is_favorite: data?.is_favorite ?? false
            })

            setImages(imagesModified.map((img, index) => {
                return {
                    id: index,
                    alt: `image-product-${index}`,
                    src: img
                }
            }))

            setIsProductFav(data?.is_favorite ?? false)

        }else{
            const status = response.error?.status;
            const apiError = response?.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 404){
                window.location.href = '/error/404'
            }else if(status === 500){
                setIsApiError(true)
            }
        }
        setIsLoading(false)
    }

    const createApiFavorite = async (favorite: Favorite) => {
        setIsInputFavDisabled(true)
        const newFavorite = await createFavorite(favorite);

        if(newFavorite.success){
            setIsProductFav(true)
        }else{
            const status = newFavorite.error?.status;
            const apiError = newFavorite?.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 409 && apiError?.code === 'FAVORITE_ALREADY_EXISTS'){
                
            }else if(status === 400 || status === 500){
                setIsApiError(true)
            }
        }
        setIsInputFavDisabled(false)
    }

    const deleteApiFavorite = async (favorite: Favorite) => {
        setIsInputFavDisabled(true)
        const deleted = await deleteFavorite(favorite.provider, favorite.external_id);

        if(deleted.success){
            setIsProductFav(false)
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
        setIsInputFavDisabled(false)
    }

    const modifiedImagesProduct = (images: string[]) => {
       return images.map((img) => { 
            const regularExpresion = /s-l\d+\.(?:jpg|jpeg|png|webp)$/i;
            
            if(product?.provider?.id === 'ebay'){
                return img.replace(regularExpresion, 's-l800.jpg')
            }
            return img
        });
    }

    const getUrlLogoProvider = (urlLogo: String) => {
        return `${process.env.NEXT_PUBLIC_API_URL}${urlLogo}`;
    }

    const handleClickFavorite = (provider: String, external_id: String) => {
        if(isProductFav){
            deleteApiFavorite({
                provider: provider,
                external_id: external_id
            })
        }else{
            createApiFavorite({
                provider: provider,
                external_id: external_id
            })
        }
    }

    useEffect(() => {
        getApiDetailProduct()
    }, [])

    return(
    <> 
        {isLoading
            ? <ProductDetailLoading/>
            :
                <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 bg-neutral-primary-soft border border-default rounded-base shadow-xs">
                    <div className="mb-[2vw] text-left rounded-xl bg-white p-2">
                        <svg onClick={() => window.history.back()} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                        </svg>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-8 lg:items-start">
                        <Carousel images={images}/>
                        <div className="mt-10 px-4 sm:px-0 sm:mt-16 lg:mt-0">
                            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">{product?.title ?? ""}</h1>
                            <div className="flex flex-row">
                                <a 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={product?.url} 
                                    className="inline-flex font-medium items-center text-fg-brand hover:underline"
                                >
                                    Ver producto
                                    <svg className="w-4 h-4 ms-2 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"/></svg>
                                </a>
                                <div className="inline-flex rounded-fill w-20 h-20 mx-auto">
                                    <NextImage
                                        src={getUrlLogoProvider(product?.provider?.logo ?? '')}
                                        alt={`logo-${product?.provider?.logo}`}
                                        width={75}
                                        height={75}
                                        style={{ width: 'auto', height: 'auto' }}
                                        unoptimized
                                    />
                                </div>
                            </div>
                            <div className="flex flex-row mt-3">
                                <h2 className="sr-only">Información de el producto</h2>
                                <p className="inline-flex text-3xl text-gray-900">{`$${product?.price ?? ""} ${product?.currency ?? ""}`}</p>
                                <div className="inline-flex ml-auto">                                
                                    <ToggleHeart
                                        value={isProductFav}
                                        disabled={isInputFavDisabled}
                                        onChange={() => handleClickFavorite(product?.provider.id ?? '', product?.product_id ?? '')}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-6">
                                <h3 className="sr-only">Descripción</h3>
                                <p 
                                    dangerouslySetInnerHTML={{__html: product?.description ?? ""}} 
                                    className="text-base text-gray-700 space-y-6">
                                </p>
                            </div>

                            <div className="mt-6">
                                <div className="mt-10 flex flex-col">
                                    <button
                                        type="button" 
                                        className="mt-4 inline-flex items-center text-body bg-neutral-primary-soft border border-default hover:bg-neutral-secondary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary-soft shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
                                    >
                                        <span className="mr-3">Notificame cuando baje de precio</span>
                                        🔔
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>  
                </div>
        }
        {isApiError && (
            <ModalError apiError={apiError} onModalHide={() => setIsApiError(false)}/>
        )}
    </>
    )

}