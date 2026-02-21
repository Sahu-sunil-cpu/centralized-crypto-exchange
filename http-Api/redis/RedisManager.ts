import { createClient, type RedisClientType } from "redis";
import type { MessageFromOrderbook, MessageToEngine } from "../types/Outgoing";


export class RedisManager {
    private client: RedisClientType;

     constructor() {
        this.client = createClient();
        this.client.connect();
    }

    public sendAndAwait(message: MessageToEngine) {
       return new Promise<MessageFromOrderbook>((resolve) => {
        const id = this.getRandomClientId();
        try {
            this.client.lPush("messages", JSON.stringify({clientId: id, message}));
        } catch (error) {
            console.error("Redis error: pushing error", error);
        }

        try {
          const message =  this.client.brPop(id, 0)
          .then((res) => {
            resolve(JSON.parse(res?.element as string));
          });
        } catch (error) {
            console.error("Redis error: poping error", error);
        }
       })
      
    }

    public getRandomClientId() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

}
