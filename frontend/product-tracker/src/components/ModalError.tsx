'use client'

import { Modal, ModalOptions } from "flowbite";
import { useEffect, useRef } from "react";

type ModalErrorProps = {
    apiError: {
        code: String, 
        message: String
    },
    onModalHide: () => void 
}


export default function ModalError({ apiError, onModalHide }: ModalErrorProps){
    const modalRef = useRef<Modal>(null);
    const modalDivRef = useRef<HTMLDivElement>(null);

    const options: ModalOptions = {
        placement: 'bottom-right',
        backdrop: 'dynamic',
        backdropClasses:
            'bg-gray-900/50 dark:bg-gray-900/80 fixed inset-0 z-40',
        closable: true
    };
    const instanceOptions = {
        id: 'popup-modal-error',
        override: true
    };

    useEffect(() => {
        if(modalDivRef.current){
            const modalDivEl = modalDivRef.current;
            modalRef.current = new Modal(modalDivEl, options, instanceOptions)
            modalRef.current.show()
        }
    }, [modalDivRef])

    const hideModal = () => {
        modalRef.current?.hide()
        onModalHide()
    }
    

    return (
    <>
        <div ref={modalDivRef} data-modal-target="popup-modal-error" id="popup-modal-error" tabIndex={-1} className="hidden overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 justify-center items-center w-full md:inset-0 h-[calc(100%-1rem)] max-h-full">
            <div className="relative p-4 w-full max-w-md max-h-full">
                <div className="relative bg-neutral-primary-soft border border-default rounded-base shadow-sm p-4 md:p-6">
                    <button 
                        onClick={() => hideModal()}
                        type="button" 
                        className="absolute top-3 end-2.5 text-body bg-transparent hover:bg-neutral-tertiary hover:text-heading rounded-base text-sm w-9 h-9 ms-auto inline-flex justify-center items-center"
                    >
                        <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18 17.94 6M18 18 6.06 6"/></svg>
                        <span className="sr-only">Close modal</span>
                    </button>
                    <div className="p-4 md:p-5 text-center">
                        <svg className="mx-auto mb-4 text-fg-disabled w-12 h-12" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 13V8m0 8h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/></svg>
                        <h3 className="mb-6 text-body">
                            Error inesperado, "{apiError.code}" intentalo mas tarde.
                            <p>
                                {apiError.message}
                            </p>
                        </h3>
                        <div className="flex items-center space-x-4 justify-center">
                            <button 
                                onClick={() => hideModal()}
                                type="button" 
                                className="text-white bg-danger box-border border border-transparent hover:bg-danger-strong focus:ring-4 focus:ring-danger-medium shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none"
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    )
}