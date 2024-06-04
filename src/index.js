"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const mqtt_1 = __importDefault(require("mqtt"));
const express_winston_1 = __importDefault(require("express-winston"));
const logger_1 = require("./logger");
let client = mqtt_1.default.connect(process.env.MQTT_URL);
dotenv_1.default.config();
const channelDictionary = {
    "downstairs": "shellyplus1-bighouse/command/switch:0",
};
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(express_winston_1.default.logger({
    winstonInstance: logger_1.logger,
    statusLevels: true
}));
app.get("/channel/:channel/message/:message/:clientName", (req, res) => {
    const mqttChannel = channelDictionary[req.params.channel];
    if (!mqttChannel) {
        res.status(404).send("Channel not found");
        return;
    }
    client.publish(mqttChannel, req.params.message);
    logger_1.logger.info(`[server]: Client ${req.params.clientName} published message "${req.params.message}" to channel "${mqttChannel}"`);
    res.sendStatus(204);
});
app.get("/", (req, res) => {
    res.send("<h1>MQTT Server</h1><p>Use /channel/:channel/message/:message/:clientName to send a message to a channel</p>");
});
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});
