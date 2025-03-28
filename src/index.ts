import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mqtt from "mqtt";
import { channelDictionary } from "./utils/channel.helper";

import expressWinston from "express-winston";
import { logger } from "./logger";
dotenv.config();

console.log(`[server]: Environment: ${process.env.NODE_ENV}`, { PORT: process.env.PORT, MQTT_URL: process.env.MQTT_URL });

let client = mqtt.connect(process.env.MQTT_URL as string);
console.log(`[server]: MQTT Server is running at ${process.env.MQTT_URL}`);

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(
    expressWinston.logger({
        winstonInstance: logger,
        statusLevels: true,
    })
);

app.get("/channel/:channel/message/:message/:clientName", (req: Request, res: Response) => {
    const mqttChannel: string = channelDictionary[req.params.channel as keyof typeof channelDictionary];
    if (!mqttChannel) {
        res.status(404).send("Channel not found");
        return;
    }
    console.log(`[server]: Publish mqtt message: ${mqttChannel} \n    ${req.params.message}`);
    logger.info(client.publish(mqttChannel, req.params.message));
    logger.info(`[server]: Client ${req.params.clientName} published message "${req.params.message}" to channel "${req.params.channel}"`);
    res.sendStatus(204);
});

app.get("/", (req: Request, res: Response) => {
    res.send("<h1>MQTT Server</h1><p>Use /channel/:channel/message/:message/:clientName to send a message to a channel</p>");
});

app.listen(port, () => {
    console.log(`[server]: Web Server is running at http://localhost:${port}`);
});

