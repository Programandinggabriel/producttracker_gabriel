'use client'

export default function ProductLoading () {
    return (
        <div
            role="status" 
            className="max-w-sm p-4 border border-default rounded-base shadow-xs animate-pulse md:p-6"
        >
            <div role="status" className="flex items-center justify-center h-48 max-w-sm bg-neutral-quaternary rounded-base animate-pulse mb-4 sm:mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5" />
                </svg>

                <span className="sr-only">Loading...</span>
            </div>
            <div className="h-2.5 bg-neutral-quaternary rounded-full w-48 mb-4"></div>
                <div className="h-2 bg-neutral-quaternary rounded-full mb-2.5"></div>
                <div className="h-2 bg-neutral-quaternary rounded-full mb-2.5"></div>
                <div className="h-2 bg-neutral-quaternary rounded-full"></div>
                <div className="flex items-center mt-4">
            </div>
            <span className="sr-only">Loading...</span>
        </div>
    )
}