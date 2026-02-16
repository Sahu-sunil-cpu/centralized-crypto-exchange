
import { z } from "zod";

export type MessageToApi = {
    type: "ORDER_PLACED",
    data: placeOrderType
} | {
    type: "ORDER_CANCELLED",
    data: cancelOrderType
} | { 
    type: "OPEN_ORDERS",
    data: Order[]
} | {
    type: "DEPTH",
    data: depthType
}




export type MessageToWs = {
    type: "ORDER_UPDATE",
    data: orderUpdateType
}

const placeOrder = z.object({
    orderId: z.string(),
    executedQty: z.number(),  // can be changed into ticker specific rooms
    fills: z.array(z.object({
        price: z.string(),
        qty: z.number(),
        tradeId: z.number()
    }))
})


const depth = z.object({
 bids: z.array(z.array(z.string(), z.string())),
 asks: z.array(z.array(z.string(), z.string()))

})

// const openOrders = z.array(z.object({
//     price: z.string(),
//     quantity: z.number(),
//     orderId: z.string(),
//     filled: z.number(),
//     side: z.enum(["buy", "sell"]),
//     userId: z.string(),
// }))

export interface Order {
    price: number;
    quantity: number;
    orderId: string;
    filled: number;
    side: "buy" | "sell";
    userId: string;
}


const cancelOrder = z.object({
    orderId: z.string(),
    executedQty: z.number(),  // can be changed into ticker specific rooms
    remainingQty: z.number()
})

const orderUpdate = z.object({
    orderId: z.string(),
    executedQty: z.number(),
    market: z.string(),
    price: z.number(),
    quantity: z.number(),
    side: z.string()
})



export type WsType = {
    stream: string,
    data: {
        t: number,
        m: boolean,
        p: string,
        q: string,
        s: string,
    }
} | {
    stream: string,
    data: {
        a: [string, string][],
        b: [string, string][],
        e: string
    }
}

export type StorageType= {
    stream: string,
    data: {
        t: number,
        m: boolean,
        p: string,
        q: string,
        s: string,
    }
}


export type placeOrderType = z.infer<typeof placeOrder>;
export type cancelOrderType = z.infer<typeof cancelOrder>;
 export type depthType = z.infer<typeof depth>;
export type orderUpdateType = z.infer<typeof orderUpdate>;



