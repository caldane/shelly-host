import { Router } from "express";
import { Request, Response } from "express";
import deviceList from "../assets/json/device-list.json";
import roomList from "../assets/json/room-list.json";
import config from "../assets/json/config.json";
import { logger } from "../logger";
import os from "os";
import { composeShellyDevice, shellyActivateMqtt, shellyGetMqttSettings, shellyReboot, shellyWebhookList } from "../utils/discovery.helper";
import { MqttResponse } from "../../../common/models/mqtt.interface";
import { DeviceList, IDevice } from "../../../common/models/device.interface";
import { mqttAddListener, mqtt as mqttClient } from "../utils/mqtt.helper";

export const shellyRouter = Router();

const networkInterfaces = os.networkInterfaces();

function getLocalIpAddress() {
    const networkAddresses = [];
    for (const name of Object.keys(networkInterfaces)) {
        const nic = networkInterfaces[name];
        if (nic === undefined) {
            continue;
        }
        for (const net of nic) {
            // Skip over non-IPv4 and internal (loopback) addresses
            if (net.family === "IPv4" && !net.internal) {
                logger.info(`Found IP address: ${net.address}`);
                networkAddresses.push(net.address);
            }
        }
    }
    const localIpAddress = networkAddresses.sort((a, b) => b.localeCompare(a))[0] || null;
    logger.info(`Selected Local IP address: ${localIpAddress}`);
    return localIpAddress;
}

const localIpAddress = getLocalIpAddress();

if (!localIpAddress) {
    console.log("Could not find local IP address");
}

shellyRouter.get("/listen", async (_: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const transactionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    mqttAddListener(transactionId, (device: IDevice) => {
        res.write(`data: ${JSON.stringify(device)}\n\n`);
    });
});

shellyRouter.get("/discover", async (_: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    if (!localIpAddress) {
        res.status(404).send("Cannot discover devices when not on a network.");
        return;
    }
    const [net1, net2, net3] = localIpAddress.split(".");
    // const shellyRooms = await shellyCloudRooms();
    // await new Promise((resolve) => setTimeout(resolve, 5000)); // Adding a delay to ensure the cloud rooms are fetched before discovering devices
    // const shellyDevices = await shellyCloudDevices();
    const shellyRooms = roomList;
    const shellyDevices: DeviceList = deviceList;
    const discoveredDevices: Promise<IDevice | null>[] = []; // Array to hold discovered devices for logging
    const counts = { successfulResponses: 0, completedRequests: 0, totalIPs: config.discover.dhcp.end - config.discover.dhcp.start };

    const requestComplete = (ip: string) => {
        counts.completedRequests++;
        res.write(`data: { "ip": "${ip}", "count": ${counts.successfulResponses}, "completed": ${counts.completedRequests}, "total": ${counts.totalIPs} }\n\n`);
    };

    const discoverSuccess = () => {
        counts.successfulResponses++;
    };

    for (let net4 = config.discover.dhcp.start; net4 < config.discover.dhcp.end; net4++) {
        const ip = `${net1}.${net2}.${net3}.${net4}`;
        discoveredDevices.push(composeShellyDevice(ip, shellyRooms, shellyDevices, requestComplete, discoverSuccess));
    }

    const foundDevices = (await Promise.all(discoveredDevices)).filter((device) => device !== null && device !== undefined);

    const mqttSettings = await Promise.all(
        foundDevices.filter((device) => device !== null && device?.mqtt?.connected).map((device) => device && shellyGetMqttSettings(device.ip))
    );
    const webhooks = await Promise.all(
        foundDevices.filter((device) => device?.room).map((device) => device && shellyWebhookList(device.ip))
    );

    logger.info(`[server]: Discovered ${foundDevices.length} devices`);

    const data: { message: string; completed: number; successful: number; total: number; devices: IDevice[] } = {
        message: "Scan complete",
        completed: counts.completedRequests,
        successful: counts.successfulResponses,
        total: counts.totalIPs,
        devices: foundDevices
            .filter((device) => device)
            .map((device): IDevice => {
                if (!device) {
                    throw new Error("Device is null or undefined");
                }

                const mqttSetting: MqttResponse = mqttSettings.find((setting) => setting?.ip === device?.ip);
                const webhookSetting = webhooks.filter(setting => setting?.result.hooks.length).find((setting) => setting?.ip === device?.ip);
                return {
                    ...device,
                    mqtt: { ...device.mqtt, ...mqttSetting?.result },
                    webhooks: webhookSetting
                } as IDevice;
            }),
    };

    res.write(`data: ${JSON.stringify(data)}\n\n`);
    res.end();
});

shellyRouter.post("/:ip/mqtt", async (req: Request, res: Response) => {
    const ip = req.params.ip;

    const mqtt = await shellyActivateMqtt(ip, req.body.device);
    if (mqtt) {
        await shellyReboot(ip);
        const device = Object.values(deviceList.data.devices).find((device) => device.ip === ip);
        if (device) {
            mqttClient.status(mqtt.device);
        }
    } else {
        res.status(404).send("Shelly device not found");
    }

    res.send(mqtt);
});
