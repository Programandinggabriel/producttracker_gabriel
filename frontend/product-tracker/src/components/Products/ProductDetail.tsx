'use client'

import { getProductById, type Provider, type ItemDetailProduct, getProviders } from "@/src/services/products";
import { useEffect, useState } from "react";
import Carousel, { type Image } from "../Carousel";
import ModalError from "../ModalError";
import ProductDetailLoading from "./ProductDetailLoading";

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
    
    const [providers, setProviders] = useState<Provider[]>([]);
    const [product, setProduct] = useState<ItemDetailProduct | null>(null);
    const [images, setImages] = useState<Image[]>([]);

    const getApiProviders = async () => {
        const providers = await getProviders();

        if(providers.success){
            const listProviders = providers.data ?? [];

            setProviders(listProviders)
        }else{
            const status = providers.error?.status;
            const apiError = providers.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 500){
                setIsApiError(true)
            }
        }
    }

    const getApiDetailProduct = async () => {
        const response = await getProductById(provider, id)
        
        if(response.success){
            const data = response.data;
            const images = data?.images ?? [];

            const imagesModified = modifiedImagesProduct(data?.provider_id ?? "", images)

            setProduct({
                provider_id: data?.provider_id ?? "",
                product_id: data?.product_id ?? "",
                title: data?.title ?? "",
                price: data?.price ?? "",
                currency: data?.currency ?? "",
                description: data?.description ?? "",
                url: data?.url ?? "",
                images: imagesModified
            })

            setImages(imagesModified.map((img, index) => {
                return {
                    id: index,
                    alt: `image-product-${index}`,
                    src: img
                }
            }))

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

    const modifiedImagesProduct = (providerId: string, images: string[]) => {
       return images.map((img) => {
            const urlSplit = img.split('/'); 
            const lastIndex = urlSplit.length - 1;
            const provider = providers.find((prov) => prov.id === providerId);
            
            if(provider?.id === 'ebay'){
                return img.replace(urlSplit[lastIndex], 's-l800.jpg')
            }
            return img
        });
    }

    useEffect(() => {
        getApiProviders()
    }, [])

    useEffect(() => {
        if(providers.length === 0) return
        getApiDetailProduct()
    }, [providers.length])

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
                            <a 
                                target="_blank"
                                rel="noopener noreferrer"
                                href={product?.url} 
                                className="inline-flex font-medium items-center text-fg-brand hover:underline"
                            >
                                Ver producto
                                <svg className="w-4 h-4 ms-2 rtl:rotate-[270deg]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 14v4.833A1.166 1.166 0 0 1 16.833 20H5.167A1.167 1.167 0 0 1 4 18.833V7.167A1.166 1.166 0 0 1 5.167 6h4.618m4.447-2H20v5.768m-7.889 2.121 7.778-7.778"/></svg>
                            </a>
                            <div className="mt-3">
                                <h2 className="sr-only">Información de el producto</h2>
                                <p className="text-3xl text-gray-900">{`$${product?.price ?? ""} ${product?.currency ?? ""}`}</p>
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
                                    <button type="button" className="py-3 rounded-md flex items-center justify-start hover:bg-gray-100">
                                        <span className="mr-3">Agregar a favoritos</span>
                                        ❤️
                                    </button>
                                    <button type="button" className="py-3 rounded-md flex items-center justify-start hover:bg-gray-100">
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