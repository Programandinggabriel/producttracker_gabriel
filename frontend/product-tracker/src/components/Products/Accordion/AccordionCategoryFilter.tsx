'use client'

import { Accordion, AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from "flowbite";
import { useEffect, useRef, useState } from "react";
import ModalError from "../../ModalError";
import { Category, getCategories } from "@/src/services/products";

type AccordionCategoryFilterProps = {
    isDropDown: Boolean;
    currentCategory: string;
    onCategorySelected: (id: string | null) => void;
}

export default function AccordionCategoryFilter({ 
    isDropDown,
    currentCategory,
    onCategorySelected 
}: AccordionCategoryFilterProps){
    const [categories, setCategories] = useState<Category[]>([]);
    
    const [isApiError, setIsApiError] = useState(false);
    const [apiError, setApiError] = useState<{code: String, message: String}>({
        code : '',
        message: ''
    });

    const divAccordionRef = useRef<HTMLDivElement>(null);
        
    const headingElement1 = useRef<HTMLHeadingElement>(null);
    const bodyElement1 = useRef<HTMLDivElement>(null);

    const accordionRef = useRef<AccordionInterface>(null);

    const [selectedValue, setSelectedValue] = useState<null|string>(null);
    
    const handleClickCategory = (e: React.MouseEvent<HTMLInputElement>) => {
        const value = selectedValue === e.currentTarget.value
            ? null
            :e.currentTarget.value

        setSelectedValue(value)
        onCategorySelected(value)
    }

    useEffect(() => {
        const getApiCategories = async() => {
            const response = await getCategories();
            
            if(response.success){
                setCategories(response.data || [])
            }else{
            const status = response.error?.status;
            const apiError = response.error?.data.error;

            setApiError({
                code: apiError?.code ?? '',
                message: apiError?.message ?? ''
            })

            if(status === 500){
                setIsApiError(true)
            }
            }
        }
        
        getApiCategories()
    }, [])

    useEffect(() => {
        setSelectedValue(currentCategory)
    }, [currentCategory])


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
                    id: 'accordion-category-heading-1',
                    triggerEl: headingElement1.current,
                    targetEl: bodyElement1.current,
                    active: false
                }
            ];

            const instanceOptions: InstanceOptions = {
                id: 'accordion-category-filter',
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

    return (
        <>
        <div 
            ref={divAccordionRef}
            id="accordion-category-filter" 
            className="rounded-base border border-default overflow-hidden shadow-xs mt-1"
        >
            <h2 
                ref={headingElement1}
                id="accordion-category-heading-1"
            >
                <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-body rounded-t-base border border-t-0 border-x-0 border-b-default hover:text-heading hover:bg-neutral-secondary-medium gap-3" data-accordion-target="#accordion-nested-body-1" aria-expanded="true" aria-controls="accordion-nested-body-1">
                    <span>Categorias</span>
                    <svg className="w-5 h-5 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>
                </button>
            </h2>
            <div 
                ref={bodyElement1}
                id="accordion-category-body"
                className="hidden border border-s-0 border-e-0 border-t-0 border-b-default" 
                aria-labelledby="accordion-category-heading-1"
            >
                <div className="p-4">
                    {categories.map((category) => {
                        return(
                            <div key={category.id} className="flex items-center">
                                <input
                                    id={`option-category-${category.id}`}
                                    name="option-category"
                                    type="radio"
                                    className="w-4 h-4 text-neutral-primary border-default-medium bg-neutral-secondary-medium rounded-full checked:border-brand focus:ring-2 focus:outline-none focus:ring-brand-subtle border border-default appearance-none"
                                    checked={selectedValue === category.id}
                                    onClick={(e) => handleClickCategory(e)}
                                    onChange={() => {}}
                                    value={category.id}
                                />
                                <label 
                                    htmlFor={`option-category-${category.id}`}
                                    className="select-none ms-2 text-sm font-medium text-heading"
                                >
                                    {category.slug}
                                </label>
                            </div>
                        )
                    })
                    }
                </div>
            </div>
        </div>
        {isApiError && (
            <ModalError apiError={apiError} onModalHide={() => setIsApiError(false)}/>
        )}
        </>
    )
}