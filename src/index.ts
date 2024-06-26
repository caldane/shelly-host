import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mqtt from "mqtt";

import expressWinston from "express-winston";
import { logger } from "./logger";

let client = mqtt.connect(process.env.MQTT_URL as string); 

dotenv.config();

const channelDictionary = {
  "downstairs": "shellyplus1-bighouse/command/switch:0",
} as const;

const app: Express = express();
const port = process.env.PORT || 3000;


app.use(expressWinston.logger({
  winstonInstance: logger,
  statusLevels: true
}))

app.get("/channel/:channel/message/:message/:clientName", (req: Request, res: Response) => {
  const mqttChannel: string = channelDictionary[req.params.channel as keyof typeof channelDictionary];
  if (!mqttChannel) {
    res.status(404).send("Channel not found");
    return;
  }
  client.publish(mqttChannel, req.params.message);
  logger.info(`[server]: Client ${req.params.clientName} published message "${req.params.message}" to channel "${mqttChannel}"`);
  res.sendStatus(204);
});

app.get("/", (req: Request, res: Response) => {
  res.send("<h1>MQTT Server</h1><p>Use /channel/:channel/message/:message/:clientName to send a message to a channel</p>");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});