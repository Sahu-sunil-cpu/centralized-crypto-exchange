import { createClient, type RedisClientType } from "redis";
import { type MessageToApi, type WsType } from "./types/OutgoingData";

export class RedisManager {
    private client: RedisClientType;
    private static instance: RedisManager;

    private constructor() {
        this.client = createClient();
        this.client.connect();
    }


    public static getInstance() {
        if (!this.instance) {
            this.instance = new RedisManager();
        }

        return this.instance;
    }


    public sendToApi(clientId: string, message: MessageToApi) {

        try {
            this.client.lPush(clientId, JSON.stringify(message));
        } catch (error) {
            console.error("Redis error: pushing error", error);
        }
    }

    public sendToWs(channel: string, message: WsType) {
        try {
            this.client.lPush("channel", JSON.stringify(message));
        } catch (error) {
            console.error("Redis error: pushing error ws", error);
        }
    }

     public sendToStorage(channel: string, message: WsType) {
        try {
            this.client.lPush("channel_storage", JSON.stringify(message));
        } catch (error) {
            console.error("Redis error: pushing error ws", error);
        }
    }


}
