import { strictObject, z, ZodType } from "zod"

export enum Actions {
    join_room = "JOIN_ROOM",
    create_order = "CREATE_ORDER",
    get_depth = "GET_DEPTH",
    cancel_order = "CANCEL_ORDER",
    get_open_orders = "GET_OPEN_ORDERS",
    on_ramp = "ON_RAMP",
}

enum OrderAction {
    bid =  "bid",
    ask = "ask"
}

export type incomingData = {
    type: Actions.join_room,
    data: JoinRoomType,
} | {
    type: Actions.create_order,
    data: CreateOrderType,
} | {
    type: Actions.get_depth,
    data: GetDepthType,
} | {
    type: Actions.cancel_order,
    data: CancelOrderType,
} | {
    type: Actions.get_open_orders,
    data: OpenOrdersType,
} | {
    type: Actions.on_ramp,
    data: OnRampType,
}

const JoinRoomSchema = z.object({
    userId: z.string(),
    roomId: z.string(),  // can be changed into ticker specific rooms
})

export type JoinRoomType = z.infer<typeof JoinRoomSchema>;

const GetOrderSchema = z.object({
    price: z.string(),
    quantity: z.string(),
    side: z.enum(["buy", "sell"]),
    market: z.string(),
    userId: z.string(), 
    orderId: z.string(),
    type: z.string() 
})

export type CreateOrderType = z.infer<typeof GetOrderSchema>;

const GetDepthSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
    market: z.string()
})

export type GetDepthType = z.infer<typeof GetDepthSchema>;

const GetCancelOrderSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
    market: z.string(),
    orderId: z.string()

})

export type CancelOrderType = z.infer<typeof GetCancelOrderSchema>;


const GetOpenOrdersSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
    market: z.string()
})

export type OpenOrdersType = z.infer<typeof GetOpenOrdersSchema>;



const OnRampSchema = z.object({
    userId: z.string(),
    roomId: z.string(),
    amount: z.string(),
    txnId: z.string(),

})

export type OnRampType = z.infer<typeof OnRampSchema>;
