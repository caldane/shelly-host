import { Router } from "express";
import { Request, Response } from "express";
import { sendMessageToDevices, sendMessageToRoom } from "../utils/channel.helper";
import { getSiteData } from "../utils/data-store.helper";

export const siteRouter = Router();

siteRouter.get("/switches", (_: Request, res: Response) => {
    try {
        const sites = getSiteData();
        const switches = Object.entries(sites).flatMap(([siteKey, siteValue]: [string, any]) => {
            const rooms = Object.values(siteValue?.rooms || {});

            return rooms.flatMap((room: any) => {
                const roomSwitches = Array.isArray(room?.switches) ? room.switches : [];
                return roomSwitches.map((switchItem: any) => ({
                    site: siteKey,
                    room: room?.name,
                    name: switchItem?.name,
                    description: switchItem?.description,
                    channel: switchItem?.channel,
                }));
            });
        });

        res.status(200).json({ switches });
    } catch (error: any) {
        res.status(500).send(error?.message || "Failed to get switches");
    }
});


siteRouter.get("/:site/room/:room/message/:message/:clientName", (req: Request, res: Response) => {
    const siteName = req.params.site.toLocaleLowerCase();
    const roomName = req.params.room.toLocaleLowerCase();

    try {
        sendMessageToRoom(siteName, roomName, req.params.clientName, req.params.message);
        res.sendStatus(204);
    } catch (error) {
        res.status(404).send(error);
    }
});

siteRouter.get("/:site/room/:room/device/:device/message/:message/:clientName", (req: Request, res: Response) => {
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