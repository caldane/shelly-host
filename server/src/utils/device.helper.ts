import { Device, IDevice } from "../../../common/models/device.interface";
import { createMqttConfig } from "./mqtt.helper";
import roomList from "../assets/json/room-list.json";

export const createIDevice = (device: Device): IDevice => {
    const room = roomList.data.rooms[device.room_id.toString() as keyof typeof roomList.data.rooms];
    return {
        ip: device.ip,
        name: device.name,
        type: device.type,
        channel: "",
        mqtt: createMqttConfig(device.name, room),
        room: room,
        switchStatus: {
            id: 0,
            source: "mqtt",
            output: false,
            temperature: {
                tC: 0,
                tF: 0,
            }
        },
        device: device,
    } as IDevice;
};
