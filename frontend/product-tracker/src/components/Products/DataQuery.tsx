'use client'

import React, { useEffect, useState } from "react"
import ButtonFilterAndOrder from "./ButtonFilterAndOrder";
import { ApplyValues, CurrentApplyValues } from "@/src/types/apply_values";

type QueryFiltersOrderProps = {
    currentValues: CurrentApplyValues;
    currentQuery: string;
    onApply: (values: ApplyValues) => void;
    onSendQueryText: (query: string) => void;
}

export default function DataQuery({ 
    currentValues,
    currentQuery,
    onApply,
    onSendQueryText 
}: QueryFiltersOrderProps){
    const [query, setQuery] = useState('');

    function handleQueryChange (e: React.ChangeEvent<HTMLInputElement>){
        const value = e.currentTarget.value;
        setQuery(value)
    }

    function handleClickApply (values: ApplyValues){
        onApply(values)
    }

    function handleSubmitForm (e: React.SubmitEvent<HTMLFormElement>){
        e.preventDefault()
        onSendQueryText(query)
    }

    useEffect(() => {
        setQuery(currentQuery)
    }, [currentQuery])
    
    return (
        <>
        <form onSubmit={(e) => {handleSubmitForm(e)}} className="max-w-2xl mx-auto">
            <div className="flex relative shadow-xs rounded-base -space-x-0.5">
                <ButtonFilterAndOrder
                    currentValues={currentValues}
                    onApply={(values) => handleClickApply(values)}
                />
                <input 
                    type="search" 
                    id="input-group-1" 
                    className="px-3 py-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm focus:ring-brand focus:border-brand block w-full placeholder:text-body" 
                    placeholder="Busca un producto" 
                    required
                    value={query}
                    onChange={(e) => {handleQueryChange(e)}} 
                />
                <button type="submit" className="inline-flex items-center  text-white bg-brand hover:bg-brand-strong box-border border border-transparent focus:ring-4 focus:ring-brand-medium shadow-xs font-medium leading-5 rounded-e-base text-sm px-4 py-2.5 focus:outline-none">
                    <svg className="w-4 h-4 me-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" strokeLinecap="round" strokeWidth="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/></svg>
                    Buscar
                </button>
            </div>
        </form>
        </>
    )
}