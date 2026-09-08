'use client'

import { deletePriceAlert, getPriceAlerts, PriceAlert } from "@/src/services/auth"
import { useEffect, useState } from "react";
import ModalError from "../ModalError";
import Image from "next/image";
import EditPriceAlert from "./EditPriceAlert";

export default function ListPriceAlerts () {
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });
    
    const [userPriceAlerts, setUserPriceAlerts] = useState<PriceAlert[]>([]);

    const getApiProductPriceAlerts = async () => {
        const alerts = await getPriceAlerts();

        if(alerts.success){
            const data = alerts.data ?? [];
            const arrayPriceAlerts = data.map(alert => alert.alert)

            setUserPriceAlerts(arrayPriceAlerts)
        }else{
            const status = alerts.error?.status;
            const apiError = alerts.error?.data.error;
            
            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if (status === 500){
                setIsApiError(true)
            }
        }
    }

    const deleteApiPriceAlert = async (id: String) => {
        const deleted = await deletePriceAlert(id);

        if(deleted.success){
            await getApiProductPriceAlerts()
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

    const handleClickRemovePriceAlert = (id: String) => {
        deleteApiPriceAlert(id)
    }

    useEffect(() => {
        getApiProductPriceAlerts()
    }, [])
    
    return (
        <>
            <div className="mx-auto flex h-[650px] w-full max-w-5xl flex-col gap-4 overflow-y-auto p-4">
                {userPriceAlerts.map((alert, index) => {
                    const alt = `price-alert-${alert.product.provider.id}-${alert.product.product_id}`

                    return (
                        <div
                            key={alert.id.toString()}
                            className="group flex w-full items-center rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md dark:border-gray-700"
                        >
                            {/* Product image */}
                            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-gray-50">
                                <Image
                                    src={alert.product.thumbnail}
                                    alt={alt}
                                    fill
                                    className="object-contain p-2"
                                    sizes="112px"
                                />
                            </div>

                            {/* Alert information */}
                            <div className="ml-5 min-w-0 flex-1">
                                <div className="mb-2 flex items-center gap-3">
                                    <span className="text-lg font-semibold">
                                        Alerta {index + 1}
                                    </span>
                                    {alert.active 
                                        ? <span
                                                className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800"
                                            >
                                                Activa
                                          </span>
                                        : <span
                                                className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800"
                                            >
                                                Inactiva
                                          </span>
                                    }
                                </div>

                                <p className="truncate text-sm">
                                    {alert.product.title}
                                </p>

                                <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
                                    <div>
                                        <span className="block text-xs">
                                            Precio objetivo
                                        </span>
                                        <span className="text-sm font-semibold">
                                            ${alert.target_price}
                                        </span>
                                    </div>

                                    <div>
                                        <span className="block text-xs">
                                            Precio actual
                                        </span>
                                        <span className="text-sm font-semibold">
                                            ${alert.product.price}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="ml-4 flex shrink-0 items-center gap-2">
                                <EditPriceAlert
                                    alertId={alert.id}
                                    index={index}
                                    onUpdated={() => getApiProductPriceAlerts()}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleClickRemovePriceAlert(alert.id)}
                                    className="rounded-lg p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200"
                                    aria-label={`Eliminar alerta ${index + 1}`}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="1.5"
                                        stroke="currentColor"
                                        className="h-5 w-5"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    )
                    })
                }
            </div>

            {isApiError 
                ? <ModalError apiError={apiError} onModalHide={() => setIsApiError(false)}/>
                : ''
            }
        </>
    )
}