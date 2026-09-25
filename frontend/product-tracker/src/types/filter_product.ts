export type AllowedFilters = "category" | "provider" | "price";

export type PriceValues = {
    min: string;
    max: string
}


type Filter = {
    field: AllowedFilters;
    value: string | null | PriceValues | Array<string>;
}

export type ProductFilter = Array<Filter>;