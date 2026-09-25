'use client'

import { act, useEffect, useState } from "react"
import AccordionFilter from "./Accordion/AccordionFilter";
import AccordionOrder from "./Accordion/AccordionOrder";
import ButtonApply from "./ButtonApply";
import { ProductFilter } from "@/src/types/filter_product";
import { ProductOrder } from "@/src/types/order_product";
import { ApplyValues, CurrentApplyValues } from "@/src/types/apply_values";

type ButtonFilterAndOrderProps = {
    currentValues: CurrentApplyValues;
    onApply: (applyValues: ApplyValues) => void
}

export default function ButtonFilterAndOrder({ currentValues, onApply }:ButtonFilterAndOrderProps){
    const [isDropDown, setIsDropDown] = useState(false);
    const [applyValues, setApplyValues] = useState<ApplyValues>({
        filters: [],
        order: []
    });
    const [countCurrentValues, setCountCurrentValues] = useState<number>(0);

    const handleChangeFilters = (filters: ProductFilter) => {
        setApplyValues(prev => ({
            ...prev,
            filters: filters
        }))
    }

    const handleChangeOrder = (order: ProductOrder) => {
        setApplyValues(prev => ({
            ...prev,
            order: order
        }))
    }

    const handleClickButtonApply = () => {
        const price = applyValues.filters.find(item => item.field === 'price');
        
        if(typeof(price?.value) === 'object' && price.value !== null && !Array.isArray(price.value)){
            if(price.value.max === "" && price.value.min !== ""){
                price.value.max = price.value.min
            }
        }
        
        onApply(applyValues)
        setIsDropDown(false)
    }

    useEffect(() => {
        setApplyValues(
            currentValues
        )
    }, [currentValues])

    useEffect(() => {
        const totalFilters = applyValues.filters.filter(
            item => item.value !== null
        ).length;
        const totalOrder = applyValues.order.filter(
            item => item.direction !== null
        ).length;

        setCountCurrentValues(totalFilters + totalOrder)
    }, [applyValues])

    return (
         <> 
            <button
                id="dropdown-button" 
                type="button" 
                className="inline-flex items-center shrink-0 z-10 text-body bg-neutral-secondary-medium box-border border border-default-medium hover:bg-neutral-tertiary-medium hover:text-heading focus:ring-4 focus:ring-neutral-tertiary font-medium leading-5 rounded-s-base text-sm px-4 py-2.5 focus:outline-none"
                onClick={() => setIsDropDown(prev => !prev)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 13.5V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m12-3V3.75m0 9.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 3.75V16.5m-6-9V3.75m0 3.75a1.5 1.5 0 0 1 0 3m0-3a1.5 1.5 0 0 0 0 3m0 9.75V10.5" />
                </svg>

                    Filtrar y Ordenar
                <svg className="w-4 h-4 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 9-7 7-7-7"/></svg>
            </button>
            {isDropDown && (
                <div 
                    id="dropdown" 
                    className="absolute z-10 top-full left-0 bg-neutral-primary-medium border border-default-medium rounded-base shadow-lg w-53 h-fill p-1"
                >
                    <AccordionFilter
                        isDropDown={isDropDown}
                        currentFilters={currentValues.filters}
                        onChangeFilters={(filters) => handleChangeFilters(filters)}
                    />
                    <AccordionOrder
                        isDropDown={isDropDown}
                        currentOrder={currentValues.order}
                        onChangeOrder={(order) => handleChangeOrder(order)}
                    />
                    <ButtonApply 
                        totalCurrentApplyValues={countCurrentValues}
                        onApply={() => handleClickButtonApply()}
                    />
                </div>
            )}
        </>
    )
}