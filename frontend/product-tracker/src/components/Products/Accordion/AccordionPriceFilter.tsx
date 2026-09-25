'use client'

import { PriceValues } from "@/src/types/filter_product";
import { Accordion, AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from "flowbite";
import { useEffect, useRef, useState } from "react";
import { NumberFormatValues, NumericFormat } from "react-number-format";

type AccordionPriceFilterProps = {
    isDropDown: Boolean;
    currentPrices: PriceValues
    onPriceChange: (price: PriceValues | null) => void;
}


export default function AccordionPriceFilter({ 
    isDropDown,
    currentPrices, 
    onPriceChange 
}: AccordionPriceFilterProps){
    const divAccordionRef = useRef<HTMLDivElement>(null);
        
    const headingElement1 = useRef<HTMLHeadingElement>(null);
    const bodyElement1 = useRef<HTMLDivElement>(null);

    const accordionRef = useRef<AccordionInterface>(null);

    const [price, setPrice] = useState<PriceValues>({
        min: "",
        max: ""
    });

    const [userTyped, setUserTyped] = useState<Boolean>(false);

    const handleChangeMinPrice = (value: NumberFormatValues) => {
        setPrice(prev => ({
            ...prev,
            ['min']: value.value
        }))
    }

    const handleChangeMaxPrice = (value: NumberFormatValues) => {
        setPrice(prev => ({
            ...prev,
            ['max']: value.value
        }))
    }

    useEffect(() => {
        const userTyping = price.max !== "" || price.min !== "";
        const hasDiff = 
            price.max !== currentPrices.max ||
            price.min !== currentPrices.min 
                ? true 
                : false;

        if(userTyping && hasDiff){
            onPriceChange({
                max: price.max,
                min: price.min
            })
        }else if(price.max === "" && price.min === "" && userTyped){
            onPriceChange(null)
        }
        
        setUserTyped(userTyping)
    }, [price, userTyped])

    useEffect(() => {
        if(currentPrices.max !== "" && currentPrices.min !== ""){
            setPrice({
                max: currentPrices.max,
                min: currentPrices.min
            })
        }
    }, [currentPrices])

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
                    id: 'accordion-price-filter-heading-1',
                    triggerEl: headingElement1.current,
                    targetEl: bodyElement1.current,
                    active: false
                }
            ];

            const instanceOptions: InstanceOptions = {
                id: 'accordion-price-filter',
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
            id="accordion-price-filter" 
            className="rounded-base border border-default overflow-hidden shadow-xs mt-1"
        >
            <h2 
                ref={headingElement1}
                id="accordion-price-filter-heading-1"
            >
                <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-body rounded-t-base border border-t-0 border-x-0 border-b-default hover:text-heading hover:bg-neutral-secondary-medium gap-3" data-accordion-target="#accordion-nested-body-1" aria-expanded="true" aria-controls="accordion-nested-body-1">
                    <span>Precio</span>
                    <svg className="w-5 h-5 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>
                </button>
            </h2>
            <div 
                ref={bodyElement1}
                id="accordion-price-filter-body"
                className="hidden border border-s-0 border-e-0 border-t-0 border-b-default" 
                aria-labelledby="accordion-price-filter-heading-1"
            >
                <div className="p-4">
                    <label 
                        htmlFor="targetPrice" 
                        className="block mb-2.5 text-sm font-medium text-heading"
                    >
                        Precio mínimo (USD)
                    </label> 
                    <NumericFormat
                        className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                        thousandSeparator=","
                        decimalSeparator="."
                        decimalScale={2}
                        fixedDecimalScale={false}
                        placeholder="0.00"
                        onValueChange={(value) => handleChangeMinPrice(value)}
                        value={price.min}                
                    />
                    <label 
                        htmlFor="targetPrice" 
                        className="block mb-2.5 text-sm font-medium text-heading mt-1"
                    >
                        Precio máximo (USD)
                    </label> 
                    <NumericFormat
                        className="bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand block w-full px-3 py-2.5 shadow-xs placeholder:text-body"
                        thousandSeparator=","
                        decimalSeparator="."
                        decimalScale={2}
                        fixedDecimalScale={false}
                        placeholder="0.00"      
                        onValueChange={(value) => handleChangeMaxPrice(value)}
                        value={price.max}                     
                    />
                </div>
            </div>
        </div>
        </>
    )
}