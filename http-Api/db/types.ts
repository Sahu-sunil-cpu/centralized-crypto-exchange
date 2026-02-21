export interface Order {
    userId: string;
    side: "buy" | "sell";
    qty: string;
    market: string;
    price: string;
    id: string;
    type: string;
}

export type Update = {
    type: "ORDER_PLACED",
    data: {
        orderId: string,
        executedQty: string,
        fills: {
            price: string;
            qty: number;
            tradeId: number;
        }[]
    }
} |
{
    type: "ORDER_CANCELED",
    data: {
        orderId: string;
        executedQty: number;
        remainingQty: number;

    }
}