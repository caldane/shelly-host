import * as mqttLibrary from "mqtt";
import { logger } from "../logger";

const client = mqttLibrary.connect(process.env.MQTT_URL as string);
logger.info(`[server]: MQTT Server is running at ${process.env.MQTT_URL}`);

export const mqtt = {
    publish: (clientName: string, channel: string, message: string) => {
        client.publish(channel, message);
        logger.info(`[server]: Client ${clientName} published message "${message}" to channel "${channel}"`);
    },
}