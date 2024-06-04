import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import mqtt from "mqtt"; // import namespace "mqtt"
let client = mqtt.connect("mqtt://192.168.86.71:1883"); // create a client

dotenv.config();

const channelDictionary = {
  "downstairs": "shellyplus1-bighouse/command/switch:0",
} as const;

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/channel/:channel/message/:message/:clientName", (req: Request, res: Response) => {
  const mqttChannel: string = channelDictionary[req.params.channel as keyof typeof channelDictionary];
  if (!mqttChannel) {
    res.status(404).send("Channel not found");
    return;
  }
  client.publish(mqttChannel, req.params.message);
  console.log(`[server]: Client ${req.params.clientName} published message "${req.params.message}" to channel "${mqttChannel}"`);
  res.sendStatus(204);
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});