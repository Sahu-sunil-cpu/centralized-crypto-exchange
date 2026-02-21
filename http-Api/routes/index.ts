import type { Request, Response } from "express";
import { RedisManager } from "../redis/RedisManager";
import { CREATE_ORDER, GET_OPEN_ORDERS } from "../types/Outgoing";
import { client as pgClient, insertOrder, updateOrder } from "../db/client"
import { generateId } from "../utils";


export async function PlaceOrder(req: Request, res: Response) {

    const { data } = req.body;
    console.log(req.body);
    const id = generateId();

    const client = new RedisManager();



    insertOrder({
            market: data.market,
            price: data.price,
            qty: data.quantity,
            side: data.side,
            userId: data.userId,
            id: id,
            type: data.type
        })

    const response = await client.sendAndAwait({
        type: CREATE_ORDER,
        data: {
            market: data.market,
            price: data.price,
            quantity: data.quantity,
            side: data.side,
            userId: data.userId.toString(),
            orderId: id,
            type: data.type
        }
    })
    // response -> database
    // inserting into redis response and fill in order
    updateOrder(response);

    res.send(
        response
    )
}

export async function getOpenOrder(req: Request, res: Response) {

        const data  = req.params;
        console.log(req.params);
        
        if(!data) return;
        const client = new RedisManager();

        const response = await client.sendAndAwait({
            type: GET_OPEN_ORDERS,
            data: {
                userId: data.userId!,
                market: data.market!

            }
        })
        // response -> database
        // inserting into redis response and fill in order


    res.send(
        response
    )
}

export async function getKlines(req: Request, res: Response) {
    const data = req.params
    
  try {
    const result = await pgClient.query(`
        SELECT *
        FROM klines_${data.bucket}
        WHERE market = $1
        ORDER BY bucket_start ASC
    `, [data.ticker]);

         res.status(200).json({
            message: result.rows
         })
  } catch(err) {
    res.status(404).json({
        error: err
    })
  }
}


export async function getOrderHistory(req: Request, res: Response) {
    const data = req.params
    
  try {
    const result = await pgClient.query(`
        SELECT *
        FROM orders
        WHERE userId = $1
    `, [data.userId]);

         res.status(200).json({
            message: result.rows
         })
  } catch(err) {
    res.status(404).json({
        error: err
    })
  }
}
