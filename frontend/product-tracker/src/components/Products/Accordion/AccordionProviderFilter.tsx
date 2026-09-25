'use client'

import { getProviders, Provider } from "@/src/services/products";
import { Accordion, AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from "flowbite";
import { useEffect, useRef, useState } from "react";
import ModalError from "../../ModalError";

type AccordionProviderFilterProps = {
    isDropDown: Boolean;
    currentProvider: Array<string>;
    onProviderSelected: (ids: Array<string> | null) => void;
}


export default function AccordionProviderFilter({ 
    isDropDown,
    currentProvider, 
    onProviderSelected 
}: AccordionProviderFilterProps){
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });

    const divAccordionRef = useRef<HTMLDivElement>(null);
        
    const headingElement1 = useRef<HTMLHeadingElement>(null);
    const bodyElement1 = useRef<HTMLDivElement>(null);

    const accordionRef = useRef<AccordionInterface>(null);

    const [selectedValue, setSelectedValue] = useState<Array<string>>([]);

    const [userSelected, setUserSelected] = useState(false);
    
    const getApiProviders = async () => {
        const providers = await getProviders();

        if(providers.success){
            const data = providers.data ?? [];
            setProviders(data)
        }else{
            const status = providers?.error?.status;
            const apiError = providers?.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 500){
                setIsApiError(true)
            }
        }
    }

    const handleClickProvider = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUserSelected(true)
        const value = e.currentTarget.value;
        const isCheck = e.currentTarget.checked;

        if(isCheck){
            setSelectedValue(prev => ([
                ...prev,
                value
            ]))
        }else{
            setSelectedValue(prev => {
                return prev.filter(
                    item => item !== value
                )
            })
        }
    }

    useEffect(() => {
        if(selectedValue.length === 0 && userSelected){
            onProviderSelected(null)
        }else if(selectedValue.length > 0){
            onProviderSelected(selectedValue)
        }
    }, [selectedValue, userSelected])

    useEffect(() => {
        setSelectedValue(currentProvider)
    }, [currentProvider])

    useEffect(() => {
        if( divAccordionRef.current && 
            headingElement1.current &&
            bodyElement1.current
        ){
            const options: AccordionOptions = {
                alwaysOpen: true,
                activeClasses: 'bg-gray-100 text-gray-900',
                inactiveClasses: 'text-body'
            }
            
            const accordionItems: AccordionItem[] = [
                {
                    id: 'accordion-provider-heading-1',
                    triggerEl: headingElement1.current,
                    targetEl: bodyElement1.current,
                    active: false
                }
            ];

            const instanceOptions: InstanceOptions = {
                id: 'accordion-provider-filter',
                override: true
            };

            const accordion: AccordionInterface = new Accordion(
                divAccordionRef.current,
                accordionItems,
                options,
                instanceOptions
            )

            accordionRef.current = accordion
        }
    }, [isDropDown])

    useEffect(() => {
        getApiProviders()
    }, [])

    return (
        <>
        <div 
            ref={divAccordionRef}
            id="accordion-provider-filter" 
            className="rounded-base border border-default overflow-hidden shadow-xs mt-2"
        >
            <h2 
                ref={headingElement1}
                id="accordion-provider-heading-1"
            >
                <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-body rounded-t-base border border-t-0 border-x-0 border-b-default hover:text-heading hover:bg-neutral-secondary-medium gap-3" data-accordion-target="#accordion-nested-body-1" aria-expanded="true" aria-controls="accordion-nested-body-1">
                    <span>Proovedor</span>
                    <svg className="w-5 h-5 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>
                </button>
            </h2>
            <div 
                ref={bodyElement1}
                id="accordion-provider-body"
                className="hidden border border-s-0 border-e-0 border-t-0 border-b-default" 
                aria-labelledby="accordion-provider-heading-1"
            >
                <div className="p-4">
                    {providers.map((provider) => {
                        return(
                            <div key={provider.id} className="flex items-center">
                                <input 
                                    id={`checkbox-${provider.id}`}
                                    name={`checkbox-${provider.id}`}
                                    type="checkbox"
                                    className="w-4 h-4 border border-gray-500 rounded-xs bg-neutral-secondary-medium focus:ring-2 focus:ring-brand-soft"
                                    value={provider.id}
                                    checked={selectedValue.includes(provider.id)}
                                    onChange={(e) => handleClickProvider(e)}
                                />
                                <label 
                                    htmlFor={`option-${provider.id}`}
                                    className="select-none ms-2 text-sm font-medium text-heading"
                                >
                                    { provider.nickname }
                                </label>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
        {isApiError && (
            <ModalError apiError={apiError} onModalHide={() => setIsApiError(false)}/>
        )}
        </>
    )
}