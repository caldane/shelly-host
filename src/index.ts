import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { channelDictionary, sendMessageToDevices, sendMessageToRoom } from "./utils/channel.helper";

import expressWinston from "express-winston";
import { logger } from "./logger";
import { mqtt } from "./utils/mqtt.helper";
import os from "os";
import config from "./assets/json/config.json"
import http from "http";
import { composeShellyDevice, discoverShelly, shellyCloudDevices, shellyCloudRooms } from "./utils/discovery.helper";

const networkInterfaces = os.networkInterfaces();

function getLocalIpAddress() {
    for (const name of Object.keys(networkInterfaces)) {
        const nic = networkInterfaces[name];
        if (nic === undefined) {
            continue;
        }
        for (const net of nic) {
            // Skip over non-IPv4 and internal (loopback) addresses
            if (net.family === 'IPv4' && !net.internal) {
                logger.info(`Found IP address: ${net.address}`);
                return net.address;
            }
        }
    }
}

const localIpAddress = getLocalIpAddress();

if (!localIpAddress) {
    console.log('Could not find local IP address');
}

dotenv.config();

logger.info(`[server]: Environment: ${process.env.NODE_ENV}`, { PORT: process.env.PORT, MQTT_URL: process.env.MQTT_URL });

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
    const { clientName, message, channel } = req.params;
    if (!mqttChannel) {
        res.status(404).send("Channel not found");
        return;
    }
    logger.info(`[server]: Publish mqtt message: ${mqttChannel} \n    ${message}`);
    mqtt.publish(clientName, mqttChannel, message);
    res.sendStatus(204);
});

app.get("/site/:site/room/:room/message/:message/:clientName", (req: Request, res: Response) => {
    const siteName = req.params.site.toLocaleLowerCase();
    const roomName = req.params.room.toLocaleLowerCase();

    try {
        sendMessageToRoom(siteName, roomName, req.params.clientName, req.params.message);
        res.sendStatus(204);
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get("/site/:site/room/:room/device/:device/message/:message/:clientName", (req: Request, res: Response) => {
    const siteName = req.params.site.toLocaleLowerCase();
    const roomName = req.params.room.toLocaleLowerCase();
    const deviceName = req.params.device.toLocaleLowerCase();
    const clientName = req.params.clientName.toLocaleLowerCase();

    try {
        sendMessageToDevices(siteName, roomName, [deviceName], clientName, req.params.message);
        res.sendStatus(204);
    } catch (error) {
        res.status(404).send(error);
    }
});

app.get("/discover", async (_: Request, res: Response) => {
    if (!localIpAddress) {
        res.status(404).send("Cannot discover devices when not on a network.");
        return;
    }
    const [net1, net2, net3] = localIpAddress.split(".");
    const shellyRooms = await shellyCloudRooms();
    await new Promise(resolve => setTimeout(resolve, 5000)); // Adding a delay to ensure the cloud rooms are fetched before discovering devices
    const shellyDevices = await shellyCloudDevices();
    const discoveredDevices: {}[] = []; // Array to hold discovered devices for logging

    for (let net4 = config.discover.dhcp.start; net4 < config.discover.dhcp.end; net4++) {
        const ip = `${net1}.${net2}.${net3}.${net4}`;
        discoveredDevices.push(composeShellyDevice(ip,
            shellyRooms,
            shellyDevices))
    }

    const foundDevices = await Promise.all(discoveredDevices as any[])

    res.send(foundDevices.filter((device) => device)); // Filter out any undefined devices
    logger.info(`[server]: Discovered ${foundDevices.length} devices: `, foundDevices);
});

app.get("/", (_: Request, res: Response) => {
    res.send("<h1>MQTT Server</h1><p>Use /channel/:channel/message/:message/:clientName to send a message to a channel</p>");
});

app.listen(port, () => {
    logger.info(`[server]: Web Server is running at http://localhost:${port}`);
});

