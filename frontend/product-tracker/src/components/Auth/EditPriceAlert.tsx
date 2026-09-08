import { useState } from "react";
import ModalUpdatePriceAlert from '@/src/components/Products/ModalUpdatePriceAlert'

type EditPriceAlertProps =  {
    alertId: String;
    index: number;
    onUpdated: () => void;
}

export default function EditPriceAlert ({ alertId, index, onUpdated }: EditPriceAlertProps){
    const [modalEditOpen, setModalEditOpen] = useState(false);

    return (
    <>
        <button
            type="button"
            onClick={() => setModalEditOpen(true)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200"
            aria-label={`Editar alerta ${index + 1}`}
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
                    d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                />
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
            </svg>
        </button>
        {modalEditOpen && (
            <ModalUpdatePriceAlert  
                alertId={alertId}
                index={index}
                onModalHide={() => setModalEditOpen(false)}
                onUpdatedPriceAlert={() => onUpdated()}
            />
        )}
    </>
    )
}