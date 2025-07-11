import "dotenv/config";
import express, { Express, Request, Response } from "express";

import expressWinston from "express-winston";
import { logger } from "./logger";

import { init } from "./utils/server.helper";



logger.info(`[server]: Environment: ${process.env.NODE_ENV}`, { PORT: process.env.PORT, MQTT_URL: process.env.MQTT_URL });

const app: Express = express();
const port = process.env.PORT || 3000;
init(app);

app.use(
    expressWinston.logger({
        winstonInstance: logger,
        statusLevels: true,
    })
);

app.get("/", (_: Request, res: Response) => {
    res.send("<h1>MQTT Server</h1><p>Use /channel/:channel/message/:message/:clientName to send a message to a channel</p>");
});

app.get("/health", (_: Request, res: Response) => {
    res.status(200).send("Healthy");
});

app.listen(port, () => {
    logger.info(`[server]: Web Server is running at http://localhost:${port}`);
});
