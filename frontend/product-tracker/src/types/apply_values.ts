import { ProductFilter } from "./filter_product";
import { ProductOrder } from "./order_product";

export type ApplyValues = {
    filters: ProductFilter;
    order: ProductOrder;    
}

export type CurrentApplyValues = {
    filters: ProductFilter;
    order: ProductOrder;  
}