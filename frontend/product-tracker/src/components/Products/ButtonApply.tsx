type ButtonApplyProps = {
    totalCurrentApplyValues? : number;
    onApply: () => void;
}

export default function ButtonApply({totalCurrentApplyValues, onApply}: ButtonApplyProps){
    return (
        <button
            className="relative ml-30 mt-2 text-body bg-gray-100 border border-b-body hover:bg-gray-300 hover:text-heading focus:ring-4 focus:ring-neutral-tertiary-soft shadow-xs font-medium leading-5 rounded-base text-sm px-4 py-2.5 focus:outline-none" 
            type="button"
            onClick={(e) => onApply()}
        >
            Aplicar
            <div className="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-danger border-2 border-buffer rounded-full -top-2 -end-2">
                {totalCurrentApplyValues}
            </div>
        </button>
    )
}