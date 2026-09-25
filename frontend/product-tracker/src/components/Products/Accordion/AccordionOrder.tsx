'use client'

import { useEffect, useRef, useState } from "react";
import AccordionPriceOrder from "./AccordionPriceOrder";
import { Accordion, AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from "flowbite";
import { AllowedOrderDirection, ProductOrder } from "@/src/types/order_product";

type AccordionOrderProps = {
    isDropDown: Boolean;
    currentOrder: ProductOrder;
    onChangeOrder: (order: ProductOrder) => void;
}

export default function AccordionOrder({
    isDropDown,
    currentOrder,
    onChangeOrder
}:AccordionOrderProps) {
    const [currentPriceOrder, setCurrentPriceOrder] = useState<AllowedOrderDirection>("");
    const [order, setOrder] = useState<ProductOrder>([]);
    
    const divAccordionRef = useRef<HTMLDivElement>(null);
    
    const headingElement1 = useRef<HTMLHeadingElement>(null);
    const bodyElement1 = useRef<HTMLDivElement>(null);

    const accordionRef = useRef<AccordionInterface>(null);


    const handlePriceOrder = (direction: AllowedOrderDirection) => {
        setOrder(prev => {
            const exists = prev.some(item => item.field === 'price');

            if(!exists){
                return [
                    ...prev,
                    {
                        field: "price",
                        direction: direction
                    }
                ]
            }else{
                return prev.map(item => {
                    if(item.field === 'price'){
                        item.direction = direction
                    }
                    return item
                })
            }
        })
    }

    useEffect(() => {
        if(order.length > 0){
            onChangeOrder(order)
        }
    }, [order])

    useEffect(() => {
        currentOrder.forEach(item => {
            if(item.field === 'price'){
                setCurrentPriceOrder(
                    item.direction
                )
            }
        })
    }, [currentOrder])

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
                    id: 'accordion-order-heading-1',
                    triggerEl: headingElement1.current,
                    targetEl: bodyElement1.current,
                    active: false
                }
            ];

            const instanceOptions: InstanceOptions = {
                id: 'accordion-order',
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
    <div
        ref={divAccordionRef} 
        id="accordion-order" 
        data-accordion="collapse" 
        className="rounded-base border border-default overflow-hidden shadow-xs"
    >
        <h2
            ref={headingElement1} 
            id="accordion-order-heading-1"
        >
            <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-body border border-x-0 border-b-default border-t-0 hover:text-heading hover:bg-neutral-secondary-medium gap-3" data-accordion-target="#accordion-collapse-body-2" aria-expanded="false" aria-controls="accordion-collapse-body-2">
                <span>Ordenar</span>
                <svg data-accordion-icon className="w-5 h-5 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>
            </button>
        </h2>
        <div 
            ref={bodyElement1}
            id="accordion-order-body" 
            className="hidden border border-s-0 border-e-0 border-t-0 border-b-default p-2" 
            aria-labelledby="accordion-order-heading-1"
        >
            <AccordionPriceOrder
                isDropDown={isDropDown}
                currentDirection={currentPriceOrder}
                onPriceOrderChange={(direction) => handlePriceOrder(direction)} 
            />
        </div>
    </div>
    )
}