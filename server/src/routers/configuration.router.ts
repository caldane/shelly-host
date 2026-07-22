import { Router } from "express";
import { Request, Response } from "express";
import { addIpAddress, getIpAddresses, removeIpAddress } from "../utils/data-store.helper";

export const configurationRouter = Router();

configurationRouter.get("/ip-addresses", (req: Request, res: Response) => {
    const search = req.query.search?.toString();
    const ipAddresses = getIpAddresses(search);
    res.status(200).json({ ipAddresses });
});

configurationRouter.post("/ip-addresses", async (req: Request, res: Response) => {
    try {
        const ipAddress = req.body?.ipAddress?.toString();
        if (!ipAddress) {
            res.status(400).send("ipAddress is required");
            return;
        }

        const ipAddresses = await addIpAddress(ipAddress);
        res.status(200).json({ ipAddresses });
    } catch (error: any) {
        res.status(500).send(error?.message || "Failed to add IP address");
    }
});

configurationRouter.delete("/ip-addresses/:ipAddress", async (req: Request, res: Response) => {
    try {
        const ipAddress = req.params.ipAddress;
        const ipAddresses = await removeIpAddress(ipAddress);
        res.status(200).json({ ipAddresses });
    } catch (error: any) {
        res.status(500).send(error?.message || "Failed to remove IP address");
    }
});
