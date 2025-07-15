import site from "../assets/json/site.json";
import { Hook } from "../../../common/models/webhooks.interface";

export const createWebhookConfig = (deviceName: string, room: number, clientName: string, mode: "on" | "off"): Hook => {
    const name = deviceName.replace(/[^a-zA-Z0-9]/g, "-").toLocaleLowerCase();

    const hookMap = {
        "on": {
            id: 1,
            event: "input.toggle_on",
            name: "Toggle Light On",
        },
        "off": {
            id: 2,
            event: "input.toggle_off",
            name: "Toggle Light Off",
        },
    }

    return {
        "id": hookMap[mode].id,
        "cid": 0,
        "enable": true,
        "event": hookMap[mode].event,
        "name": hookMap[mode].name,
        "ssl_ca": "ca.pem",
        "urls": [
            `http://${site.buffington.webhook}/api/message/srd/${site.buffington.name}/${room}/${name}/switch/message/toggle/${clientName}`
        ],
        "condition": null,
        "repeat_period": 0
    };
};
