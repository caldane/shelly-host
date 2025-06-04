import cors from "cors";
import express, { Express } from "express";
import { logger } from "../logger";
import { messageRouter } from "../routers/message.router";
import { shellyRouter } from "../routers/shelly.router";
import { siteRouter } from "../routers/site.router";

const init = (app: Express) => {
    logger.info(`Add middleware for json parser.`);
    app.use(express.json({ limit: "50mb" }));
    app.use(express.urlencoded({ limit: "50mb", extended: true }));

    logger.info(`Register cors domain: ${process.env.CLIENT_URL}`);
    const corsOptions = {
        origin: [process.env.CLIENT_URL as string],
        optionsSuccessStatus: 204,
        credentials: true
    };
    app.use(cors(corsOptions));

    app.use(`${process.env.VHOST_PREFIX}/message`, messageRouter);
    app.use(`${process.env.VHOST_PREFIX}/shelly`, shellyRouter);
    app.use(`${process.env.VHOST_PREFIX}/site`, siteRouter);

};

export { init };
