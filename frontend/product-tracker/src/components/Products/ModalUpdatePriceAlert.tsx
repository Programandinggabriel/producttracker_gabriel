import { UpdatePriceAlert, type CreatePriceAlert } from "@/src/types/auth";
import { FormError } from "@/src/types/form-error";
import { Modal, ModalOptions } from "flowbite"
import { useEffect, useRef, useState } from "react"
import Alert from "../Alert";
import { ErrorAlertMap } from "@/src/types/alert";
import { AlertDirection, DetailPriceAlert, getPriceAlertById, updatePriceAlert } from "@/src/services/auth";
import { NumberFormatValues, NumericFormat } from "react-number-format";

type ModalPriceAlertProps = {
    alertId: String;
    index: number;
    onModalHide: () => void;
    onUpdatedPriceAlert: () => void;
}

export default function ModalUpdatePriceAlert ({ 
    alertId,
    index,
    onModalHide,
    onUpdatedPriceAlert
}: ModalPriceAlertProps){    
    let modalRef = useRef<Modal>(null);
    const divModalRef = useRef<HTMLDivElement>(null);
    
    const [currentData, setCurrentData] = useState<DetailPriceAlert | null>(null);

    const [formErrors, setFormErrors] = useState<FormError[]>([])
    const [formData, setFormData] = useState<UpdatePriceAlert>({
        provider: null,
        current_price: '',
        currency: '',
        direction : null,
        price_target: '',
        active: false,
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

    useEffect(() => {
        getApiCurrentData(alertId)
    }, [alertId])

    useEffect(() => {
        if(currentData){
            setFormData({
                provider: currentData.product.provider,
                current_price: currentData.product.price,
                currency: currentData.product.currency,
                direction: currentData.direction?.toLowerCase() ?? '',
                price_target: currentData.target_price,
                active: currentData.active
            })
        }
    }, [currentData])

    async function getApiCurrentData(id: String){
        const current = await getPriceAlertById(id);
        const data = current.data?.alert ?? null;

        if(!current.success){
            const status = current.error?.status;

            setFormErrors([])
            if(status === 500) {
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
            setCurrentData(data)
        }
    }

    async function updateApiPriceAlert(id: String, formData: UpdatePriceAlert) {
        const updated = await updatePriceAlert(id, formData);

        if(!updated.success){
            const status = updated.error?.status;
            const code = updated.error?.data.error.code;

            setFormErrors([])
            if(status === 400){
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
            onUpdatedPriceAlert()
            modalRef.current?.hide()
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
                'decrease', 
                'increase', 
                null
            ];
            return allowedDirections?.includes(value)
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
        }))
    }

    const handleChangeActive = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.currentTarget.checked;
        
        setFormData(prev => ({
            ...prev,
            active: value
        }))
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
            priceTargetNumber < Number(formData.current_price)
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
            priceTargetNumber > Number(formData.current_price)
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
            await updateApiPriceAlert(alertId, formData)
        }
    }

    return (
        <div ref={divModalRef} id="modal-create-price-alert" tabIndex={-1} aria-hidden="true" className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
                    <div className="flex items-center justify-between border-b border-default pb-4 md:pb-5">
                        <h3 className="text-lg font-medium text-heading">
                            Editando alerta {index + 1}
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
                                    value={formData.provider?.nickname ?? ''}
                                    readOnly
                                    disabled 
                                />
                            </div>
                            <div className="col-span-1">
                                <label 
                                    htmlFor="currentPrice" 
                                    className="block mb-2.5 text-sm font-medium text-heading"
                                >
                                    Precio actual ({formData.currency})
                                </label>
                                <input
                                    className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                                    id="currentPrice"
                                    name="currentPrice" 
                                    type="text"
                                    value={formData.current_price} 
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
                                            checked={formData.direction === 'increase'} 
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
                                    Precio objetivo ({formData.currency})
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
                            <div className="col-span-1">
                                <label className="inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={formData.active}
                                        onChange={(e) => handleChangeActive(e)}
                                    />
                                    <div className="relative w-9 h-5 bg-neutral-quaternary peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-soft dark:peer-focus:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
                                    <span className="select-none ms-3 text-sm font-medium text-heading">Activa</span>
                                </label>
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
                                Actualizar
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