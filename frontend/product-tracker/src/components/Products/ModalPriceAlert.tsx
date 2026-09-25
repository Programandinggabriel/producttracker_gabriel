import { Provider } from "@/src/services/products";
import { type CreatePriceAlert } from "@/src/types/auth";
import { FormError } from "@/src/types/form-error";
import { Modal, ModalOptions } from "flowbite"
import { useEffect, useRef, useState } from "react"
import Alert from "../Alert";
import { ErrorAlertMap } from "@/src/types/alert";
import { AlertDirection, createPriceAlert } from "@/src/services/auth";
import { NumberFormatValues, NumericFormat } from "react-number-format";

type ModalPriceAlertProps = {
    provider: Provider | null;
    externalId: string;
    currentPrice: string;
    currency: string;
    onModalHide: () => void;
    onCreatedPriceAlert: () => void;
}

export default function ModalPriceAlert ({ 
    onModalHide, 
    onCreatedPriceAlert,
    provider, 
    externalId, 
    currentPrice,
    currency
}: ModalPriceAlertProps){    
    let modalRef = useRef<Modal>(null);
    const divModalRef = useRef<HTMLDivElement>(null);
    
    const [formErrors, setFormErrors] = useState<FormError[]>([])
    const [formData, setFormData] = useState<CreatePriceAlert>({
        provider: provider?.id ?? '',
        external_id : externalId,
        direction : 'decrease',
        price_target: currentPrice
    });

    const options: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
        closable: true,
        onHide: () => {
            onModalHide()
        }
    };

    const instanceOptions = {
        id: 'modal-create-price-alert',
        override: true
    }

    useEffect(() => {
        if(divModalRef.current){
            const element = divModalRef.current;
            modalRef.current = new Modal(element, options, instanceOptions)
        }
    }, [divModalRef])

    useEffect(() => {
        if(modalRef.current){
            modalRef.current.show()
        }
    }, [modalRef])

    async function createApiPriceAlert(formData: CreatePriceAlert) {
        const created = await createPriceAlert(formData);

        if(!created.success){
            const status = created.error?.status;
            const code = created.error?.data.error.code;

            setFormErrors([])
            if(status === 409 && code === 'PRICE_ALERT_ALREADY_EXISTS'){
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "form",
                        field: 'any',
                        message: `Ya creaste esta alerta`
                    }
                ])
            }else if(status === 400){
                setFormErrors((prev) => [
                    ...prev,
                    {
                        typeError: "form",
                        field: 'any',
                        message: `Revisa la información`
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
            modalRef.current?.hide()
            onCreatedPriceAlert()
        }
    }

    const handleHideModal = () => {
        if(modalRef.current)
            modalRef.current.hide()
    }
    
    const handleChangeOption = (e: React.ChangeEvent<HTMLInputElement>) => {
        const direction = e.currentTarget.value;

        function isValidDirection (value: AlertDirection): value is AlertDirection {
            const allowedDirections: AlertDirection[] = [
                'increase', 
                'decrease',
                null
            ];
            return allowedDirections.includes(value) 
        }

        setFormData(prev => {
            return {
                ...prev,
                direction: isValidDirection(direction) ? direction : null
            }
        })
    }

    const handleChangePrice = (value: NumberFormatValues) => {
        setFormData(prev => ({
            ...prev,
            price_target: value.value
        }));
    }

    const onSubmitForm = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        let errors: { field: string }[] = [];

        setFormErrors([])
        if(formData.direction === null){
            errors.push({ field: 'direction' })
            setFormErrors((prev) => [
                ...prev,
                {
                    typeError: 'required',
                    field: 'direction',
                    message: `¿El precio sube o baja?`
                }
            ])
        }

        const priceTargetNumber = Number(formData.price_target);

        if(formData.price_target === '' || !Number.isFinite(priceTargetNumber)){
            errors.push({ field: 'price_target' })
            setFormErrors((prev) => [
                ...prev,
                {
                    typeError: 'required',
                    field: 'price_target',
                    message: `El precio objetivo es incorrecto`
                }
            ])
        }

        if(
            formData.direction === 'increase' && 
            priceTargetNumber < Number(currentPrice)
        ){
            errors.push({ field: 'price_target' })
            setFormErrors((prev) => [
                ...prev,
                {
                    typeError: 'invalid',
                    field: 'price_target',
                    message: `El precio objetivo debe ser mayor al precio actual`
                }
            ])
        }

        if(
            formData.direction === 'decrease' && 
            priceTargetNumber > Number(currentPrice)
        ){
            errors.push({ field: 'price_target' })
            setFormErrors((prev) => [
                ...prev,
                {
                    typeError: 'invalid',
                    field: 'price_target',
                    message: `El precio objetivo debe ser menor al precio actual`
                }
            ])
        }


        if(errors.length === 0){
            await createApiPriceAlert(formData)
        }
    }

    return (
        <div ref={divModalRef} id="modal-create-price-alert" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                        <h3 className="text-lg font-medium text-heading">
                            Creando alerta (cambio de precio)
                        </h3>
                        <button onClick={() => handleHideModal()} type="button" className="text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center">
                            <svg 
                                className="w-5 h-5" 
                                aria-hidden="true" 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                fill="none" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    stroke="currentColor" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M6 18 17.94 6M18 18 6.06 6"
                                />
                            </svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>
                    <form onSubmit={(e) => onSubmitForm(e)}>
                        <div className="grid gap-4 grid-cols-2 py-4 md:py-6">
                            <div className="col-span-1">
                                <label 
                                    htmlFor="provider" 
                                    className="block mb-2.5 text-sm font-medium text-heading"
                                >
                                    Proveedor
                                </label>
                                <input
                                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                                    id="provider"
                                    name="provider"
                                    type="text" 
                                    value={provider?.nickname}
                                    readOnly
                                    disabled 
                                />
                            </div>
                            <div className="col-span-1">
                                <label 
                                    htmlFor="currentPrice" 
                                    className="block mb-2.5 text-sm font-medium text-heading"
                                >
                                    Precio actual ({currency})
                                </label>
                                <input
                                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                                    id="currentPrice"
                                    name="currentPrice" 
                                    type="text"
                                    value={currentPrice} 
                                    readOnly
                                    disabled
                                />
                            </div>
                            <div className="col-span-2">
                                <label 
                                    htmlFor="provider" 
                                    className="block mb-2.5 text-sm font-medium text-heading"
                                >
                                    Quiero que me avises cuando el precio
                                </label>
                                <div className="flex items-center justify-around mb-4">
                                    <div>
                                        <input 
                                            id="default-radio-1" 
                                            type="radio" 
                                            value="decrease" 
                                            name="default-radio" 
                                            className="w-4 h-4 text-neutral-primary border-default-medium bg-neutral-secondary-medium rounded-full checked:border-brand focus:ring-2 focus:outline-none focus:ring-brand-subtle border border-default appearance-none"
                                            checked={formData.direction === 'decrease'}
                                            onChange={(e) => handleChangeOption(e)}
                                        />
                                        <label 
                                            htmlFor="default-radio-1" 
                                            className="select-none ms-2 text-sm font-medium text-heading"
                                        >
                                            🔽 Baje 
                                        </label>
                                    </div>
                                    <div>
                                        <input
                                            id="default-radio-1" 
                                            type="radio" 
                                            value="increase" 
                                            name="default-radio" 
                                            className="w-4 h-4 text-neutral-primary border-default-medium bg-neutral-secondary-medium rounded-full checked:border-brand focus:ring-2 focus:outline-none focus:ring-brand-subtle border border-default appearance-none"
                                            onChange={(e) => handleChangeOption(e)}
                                        />
                                        <label 
                                            htmlFor="default-radio-1" 
                                            className="select-none ms-2 text-sm font-medium text-heading"
                                        >
                                            🔼 Suba
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-2">
                                <label 
                                    htmlFor="targetPrice" 
                                    className="block mb-2.5 text-sm font-medium text-heading"
                                >
                                    Precio objetivo ({currency})
                                </label> 
                                <NumericFormat
                                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                                    thousandSeparator=","
                                    decimalSeparator="."
                                    decimalScale={2}
                                    fixedDecimalScale={false}
                                    placeholder="0.00"
                                    value={String(formData.price_target)}
                                    onValueChange={(value) => handleChangePrice(value)}
                                />
                            </div>
                        </div>
                        {
                            formErrors.map((error, index) => {
                                const typeAlert = ErrorAlertMap[error.typeError];
                                const message = error.message;
            
                                return(
                                    <Alert key={index} typeAlert={typeAlert}  message={message}/>
                                )
                            })
                        }
                        <div className="flex items-center space-x-4 border-t border-default pt-4 md:pt-6">
                            <button type="submit" className="inline-flex items-center  text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none">
                                <svg className="w-4 h-4 me-1.5 -ms-0.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14m-7 7V5"/></svg>
                               Crear alerta
                            </button>
                            <button
                                onClick={() => handleHideModal()}
                                type="button" 
                                className="text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}