import { Router } from "express";
import { Request, Response } from "express";
import { sendMessageToDevices, sendMessageToRoom } from "../utils/channel.helper";

export const siteRouter = Router();


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