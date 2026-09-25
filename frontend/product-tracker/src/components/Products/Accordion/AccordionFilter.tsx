'use client'

import { Accordion, AccordionInterface, AccordionItem, AccordionOptions, InstanceOptions } from "flowbite";
import { useRef, useEffect, useState } from "react";
import AccordionProviderFilter from "./AccordionProviderFilter";
import AccordionCategoryFilter from "./AccordionCategoryFilter";
import AccordionPriceFilter from "./AccordionPriceFilter";
import { AllowedFilters, PriceValues, ProductFilter } from "@/src/types/filter_product";

type CurrentValues = {
    category: string;
    provider: Array<string>;
    price: PriceValues;
}

type AccordionFilterProps = {
    isDropDown: Boolean;
    currentFilters: ProductFilter;
    onChangeFilters: (filters: ProductFilter) => void;
}

export default function AccordionFilter({    
    isDropDown, 
    currentFilters,
    onChangeFilters 
}: AccordionFilterProps){

    const [currentValues, setCurrentValues] = useState<CurrentValues>({
        category: "",
        provider: [],
        price: {
            max: "",
            min: ""
        }
    })

    const [filters, setFilters] = useState<ProductFilter>([]);

    const divAccordionRef = useRef<HTMLDivElement>(null);
    
    const headingElement1 = useRef<HTMLHeadingElement>(null);
    const bodyElement1 = useRef<HTMLDivElement>(null);

    const accordionRef = useRef<AccordionInterface>(null);

    function upsertFilter(
        currentFilters: ProductFilter, 
        field: AllowedFilters, 
        value: string | null | PriceValues | Array<string>
    ) {
        const exists = currentFilters.some(item => item.field === field);

        if(!exists){
            return [
                ...currentFilters,
                {
                    field: field,
                    value: value
                }
            ]
        }else{
            return currentFilters.map(item => {
                if(item.field === field){
                    item.value = value
                }
                return item;
            })
        }
    }

    const handleCategory = (id: string | null) => {
        setFilters(prev => {
            const filters = upsertFilter(prev, 'category', id);
            return filters
        })
    }

    const handleProvider = (ids: Array<string> | null) => {
        setFilters(prev => {
            const filters = upsertFilter(prev, 'provider', ids);
            return filters
        })
    }

    const handlePrice = (values: PriceValues | null) => {
        setFilters(prev => {
            const filters = upsertFilter(prev, 'price', values);
            return filters
        })
    }

    useEffect(() => {
        const category = currentFilters.find(
            item => item.field === "category"
        );

        const provider = currentFilters.find(
            item => item.field === "provider"
        );

        const price = currentFilters.find(
            item => item.field === "price"
        );

        setCurrentValues({
            category: category?.value?.toString() ?? "",
            provider: Array.isArray(provider?.value) ? provider.value : [],
            price:
                typeof price?.value === "object" && price.value !== null && !Array.isArray(price.value)
                    ? {
                        min: price.value.min,
                        max: price.value.max
                    }
                    : {
                        min: "",
                        max: ""
                    }
        });
    }, [currentFilters]);


    useEffect(() => {
        if(filters.length > 0){
            onChangeFilters(filters)
        }
    }, [filters])

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
                    id: 'accordion-filter-heading-1',
                    triggerEl: headingElement1.current,
                    targetEl: bodyElement1.current,
                    active: false
                }
            ];

            const instanceOptions: InstanceOptions = {
                id: 'accordion-filter',
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
            id="accordion-filter" 
            data-accordion="collapse" 
            className="rounded-base border border-default overflow-hidden shadow-xs"
        >
            <h2 
                ref={headingElement1} 
                id="accordion-filter-heading-1"
            >
                <button type="button" className="flex items-center justify-between w-full p-5 font-medium rtl:text-right text-body rounded-t-base border border-t-0 border-x-0 border-b-default hover:text-heading hover:bg-neutral-secondary-medium gap-3" data-accordion-target="#accordion-collapse-body-1" aria-expanded="true" aria-controls="accordion-collapse-body-1">
                    <span>Filtrar</span>
                    <svg data-accordion-icon className="w-5 h-5 rotate-180 shrink-0" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m5 15 7-7 7 7"/></svg>
                </button>
            </h2>
            <div 
                ref={bodyElement1} 
                id="accordion-filter-body-1" 
                className="hidden border border-s-0 border-e-0 border-t-0 border-b-default p-2" 
                aria-labelledby="accordion-filter-heading-1"
            >
                <AccordionCategoryFilter
                    isDropDown={isDropDown}
                    currentCategory={currentValues.category}
                    onCategorySelected={(id) => handleCategory(id)}
                />
                <AccordionProviderFilter
                    isDropDown={isDropDown}
                    currentProvider={currentValues.provider}
                    onProviderSelected={(ids) => handleProvider(ids)}
                />
                <AccordionPriceFilter
                    isDropDown={isDropDown}
                    currentPrices={currentValues.price}
                    onPriceChange={(values) => handlePrice(values)}
                />
            </div>
        </div>
    )
}