type AllowedOrder = "price"

export type AllowedOrderDirection = string | "asc" | "desc" | null

type Order = {
    field: AllowedOrder;
    direction: AllowedOrderDirection
}

export type ProductOrder = Array<Order>;