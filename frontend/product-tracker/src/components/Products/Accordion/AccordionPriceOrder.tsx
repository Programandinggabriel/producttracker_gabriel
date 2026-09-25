'use client'

import { AllowedOrderDirection } from "@/src/types/order_product";
import { Accordion, AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from "flowbite";
import { useEffect, useRef, useState } from "react";

type AccordionPriceOrderProps = {
    isDropDown: Boolean;
    currentDirection: AllowedOrderDirection;
    onPriceOrderChange: (direction: AllowedOrderDirection) => void;
}


export default function AccordionPriceOrder({ 
    isDropDown,
    currentDirection, 
    onPriceOrderChange 
}: AccordionPriceOrderProps){
    const divAccordionRef = useRef<HTMLDivElement>(null);
        
    const headingElement1 = useRef<HTMLHeadingElement>(null);
    const bodyElement1 = useRef<HTMLDivElement>(null);

    const accordionRef = useRef<AccordionInterface>(null);

    const [selectedValue, setSelectedValue] = useState<string | null>(null);

    const handleClickDirectionOption = (e: React.MouseEvent<HTMLInputElement>) => {
        const direction = selectedValue === e.currentTarget.value
            ? null
            : e.currentTarget.value;

        function isValidDirection (value: AllowedOrderDirection): value is AllowedOrderDirection {
            const allowedOrderDirection: AllowedOrderDirection[] = [
                'asc',
                'desc',
                null
            ];
            return allowedOrderDirection.includes(value)
        }
        
        if(isValidDirection(direction)){
            setSelectedValue(direction)
            onPriceOrderChange(direction)
        }
    }


    useEffect(() => {
        setSelectedValue(currentDirection)
    }, [currentDirection])

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
                    id: 'accordion-price-order-heading-1',
                    triggerEl: headingElement1.current,
                    targetEl: bodyElement1.current,
                    active: false
                }
            ];

            const instanceOptions: InstanceOptions = {
                id: 'accordion-price-order',
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
            id="accordion-price-order" 
            className="rounded-base border border-default overflow-hidden shadow-xs mt-1"
        >
            <h2 
                ref={headingElement1}
                id="accordion-price-order-heading-1"
            >
                <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-body rounded-t-base border border-t-0 border-x-0 border-b-default hover:text-heading hover:bg-neutral-secondary-medium gap-3" data-accordion-target="#accordion-nested-body-1" aria-expanded="true" aria-controls="accordion-nested-body-1">
                    <span>Precio</span>
                    <svg className="w-5 h-5 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>
                </button>
            </h2>
            <div 
                ref={bodyElement1}
                id="accordion-price-order-body"
                className="hidden border border-s-0 border-e-0 border-t-0 border-b-default" 
                aria-labelledby="accordion-price-heading-1"
            >
                <div className="p-4">
                    <div className="flex items-center">
                        <input 
                            id="option-asc"
                            name="option-price-order"
                            type="radio"
                            className="w-4 h-4 text-neutral-primary border-default-medium bg-neutral-secondary-medium rounded-full checked:border-brand focus:ring-2 focus:outline-none focus:ring-brand-subtle border border-default appearance-none"
                            value='asc'
                            checked={selectedValue === 'asc'}
                            onClick={(e) => handleClickDirectionOption(e)}
                            onChange={() => {}}
                        />
                        <label 
                            htmlFor="option-asc"
                            className="select-none ms-2 text-sm font-medium text-heading"
                        >
                            De menor a mayor
                        </label>
                    </div>
                     <div className="flex items-center">
                        <input 
                            id="option-desc"
                            name="option-price-order"
                            type="radio"
                            className="w-4 h-4 text-neutral-primary border-default-medium bg-neutral-secondary-medium rounded-full checked:border-brand focus:ring-2 focus:outline-none focus:ring-brand-subtle border border-default appearance-none"
                            value='desc'
                            checked={selectedValue === 'desc'}
                            onClick={(e) => handleClickDirectionOption(e)}
                            onChange={() => {}}
                        />
                        <label 
                            htmlFor="option-desc"
                            className="select-none ms-2 text-sm font-medium text-heading"
                        >
                            De mayor a menor
                        </label>
                    </div>
                </div>
            </div>
        </div>
        </>
    )
}