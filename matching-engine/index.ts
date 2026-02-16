
import { Engine } from "./engine/Engine";
import { RedisManager } from "./RedisManager";
import { Actions, type incomingData } from "./types/IncomingData";
import { createClient } from "redis";

const redis_url = process.env.REDIS_URL;
if(!redis_url) throw new Error("REDIS_URL is not set");
const engine = new Engine();
const client = createClient({
    url: redis_url
});


// here websockets needed to be implemented
export function QueueHandler(clientId: string, message: incomingData) {

    // console.log(message)
    // console.log(message.data)


    switch (message.type) {
        case Actions.create_order:
            const msg = message.data;
            try {

                console.log(msg.side)
                const istTime = new Date().toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata"
                });

                const { executedQty, fills, orderId } = engine.createOrder(msg.market, msg.price, msg.quantity, msg.side, msg.userId, msg.orderId, istTime, msg.type);

                RedisManager.getInstance().sendToApi(clientId, {
                    type: "ORDER_PLACED",
                    data: {
                        orderId,
                        executedQty,
                        fills
                    }
                })
            } catch (e) {
                console.log(e);
                RedisManager.getInstance().sendToApi(clientId, {
                    type: "ORDER_CANCELLED",
                    data: {
                        orderId: msg.orderId,
                        executedQty: 0,
                        remainingQty: 0
                    }
                });
            }
            break;
        case Actions.cancel_order:
            const data = message.data;

            try {

                const orderId = data.orderId;
                const cancelMarket = data.market;
                const cancelOrderbook = engine.getOrderBook().find(o => o.ticker() === cancelMarket);
                const quoteAsset = cancelMarket.split("_")[1];
                if (!cancelOrderbook) {
                    throw new Error("No orderbook found");
                }

                const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                if (!order) {
                    console.log("No order found");
                    throw new Error("No order found");
                }

                if (order.side === "buy") {
                    const price = cancelOrderbook.cancelBid(order)
                    const leftQuantity = (order.quantity - order.filled) * order.price;
                    //@ts-ignore
                    this.balances.get(order.userId)[BASE_CURRENCY].available += leftQuantity;
                    //@ts-ignore
                    this.balances.get(order.userId)[BASE_CURRENCY].locked -= leftQuantity;
                    if (price) {
                        engine.sendUpdatedDepthAt(price.toString(), cancelMarket);
                    }
                } else {
                    const price = cancelOrderbook.cancelAsk(order)
                    const leftQuantity = order.quantity - order.filled;
                    //@ts-ignore
                    this.balances.get(order.userId)[quoteAsset].available += leftQuantity;
                    //@ts-ignore
                    this.balances.get(order.userId)[quoteAsset].locked -= leftQuantity;
                    if (price) {
                        engine.sendUpdatedDepthAt(price.toString(), cancelMarket);
                    }
                }

                RedisManager.getInstance().sendToApi(clientId, {
                    type: "ORDER_CANCELLED",
                    data: {
                        orderId: data.orderId,
                        executedQty: 0,
                        remainingQty: 0
                    }
                });

            } catch (e) {
                console.log("Error while cancelling order",);
                console.log(e);
            }
            break;
        case Actions.get_open_orders:
            const openOrderData = message.data;


            try {
                const openOrderbook = engine.getOrderBook().find(o => o.ticker() === openOrderData.market);
                if (!openOrderbook) {
                    throw new Error("No orderbook found");
                }
                const openOrders = openOrderbook.getOpenOrders(openOrderData.userId);

                RedisManager.getInstance().sendToApi(clientId, {
                    type: "OPEN_ORDERS",
                    data: openOrders
                });
            } catch (e) {
                console.log(e);
            }
            break;

        case Actions.on_ramp:
            const onRampData = message.data;

            const userId = onRampData.userId;
            const amount = Number(onRampData.amount);
            engine.onRamp(userId, amount);
            break;

        case Actions.get_depth:
            const depthData = message.data;

            try {
                const market = depthData.market;
                const orderbook = engine.getOrderBook().find(o => o.ticker() === market);
                if (!orderbook) {
                    throw new Error("No orderbook found");
                }
                RedisManager.getInstance().sendToApi(clientId, {
                    type: "DEPTH",
                    data: orderbook.getDepth()
                });
            } catch (e) {
                console.log(e);
                RedisManager.getInstance().sendToApi(clientId, {
                    type: "DEPTH",
                    data: {
                        bids: [],
                        asks: []
                    }
                });
            }
            break;
    }
}



async function StartEngine() {

    try {
        await client.connect();
        console.log("matching engine is running");

        while (true) {
            try {
                const response = await client.brPop("messages", 0);
                const element = response?.element as string;
                console.log(element)

                const { clientId, message } = JSON.parse(element);

                await QueueHandler(clientId, message);



            } catch (error) {
                console.error("error while popping elements from queue");
            }
        }
    } catch (error) {
        console.error("error connecting to redis");

    }
}

StartEngine();

