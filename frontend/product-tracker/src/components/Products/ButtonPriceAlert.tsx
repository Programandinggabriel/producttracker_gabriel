import { useState } from "react"
import ModalPriceAlert from "./ModalPriceAlert";
import { Provider } from "@/src/services/products";

type ButtonPriceAlertProps = {
    provider: Provider | null;
    external_id: string;
    currentPrice: string;
    currency: string;
}

export default function ButtonPriceAlert ({ 
    provider, 
    external_id, 
    currentPrice, 
    currency
}: ButtonPriceAlertProps) {
    const [showModal, setShowModal] = useState(false);
    const [alertWasCreated, setAlertWasCreated] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowModal(true)}
                type="button"
                className="w-96 mx-auto text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
            >
                <span className="mr-3">Notificame cuando baje de precio</span>
                🔔
            </button>
            {alertWasCreated && (
                <p className="text-success mx-auto">Alerta creada</p>
            )}
            
            {showModal && (
                <ModalPriceAlert 
                    provider={provider}
                    externalId={external_id}
                    currentPrice={currentPrice}
                    currency={currency}
                    onCreatedPriceAlert={() => setAlertWasCreated(true)}
                    onModalHide={() => setShowModal(false)}
                />
            )}
        </>
    )
}