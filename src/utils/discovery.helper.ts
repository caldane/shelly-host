import config from "../assets/json/config.json";
import { logger } from "../logger";
import { postRequest } from "./http.helper";

export const discoverShelly = async (ip: string): Promise<any> => {
    const options = {
        hostname: ip,
        port: 80,
        path: '/rpc/Shelly.GetStatus',
        method: 'POST',
        family: 4,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'ShellyApp/1.0',
            'Connection': 'keep-alive'
        },
        body: {
            id: 0,
            method: "Shelly.GetStatus",
        },
    };

    const postResponse = await postRequest<{ sys: { mac: string } }>(
        `http://${ip}/rpc/Shelly.GetStatus`,
        {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(JSON.stringify(options.body)),
            'Accept': 'application/json',
            'User-Agent': 'ShellyApp/1.0',
            'Connection': 'keep-alive'
        },
        options.body
    );

    return postResponse.sys.mac;
};

export const shellyCloudDevices = async (): Promise<any> => {
    const auth_key = process.env.SHELLY_CLOUD_AUTH_KEY;
    const postData = {
        'auth_key': auth_key, // Use your actual auth key here
    };

    const postResponse = await postRequest<{}>(
        `${config.discover["cloud-access"].url}${config.discover["cloud-access"]["list-path"]}`,
        {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': "shelly-89-eu.shelly.cloud"
        },
        postData
    );

    return postResponse;
}

export const shellyCloudRooms = async (): Promise<any> => {
    const auth_key = process.env.SHELLY_CLOUD_AUTH_KEY;
    const postData = {
        'auth_key': auth_key, // Use your actual auth key here
    };

    const postResponse = await postRequest<{}>(
        `${config.discover["cloud-access"].url}${config.discover["cloud-access"]["room-list-path"]}`,
        {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Host': "shelly-89-eu.shelly.cloud"
        },
        postData
    );

    return postResponse;
}

export const composeShellyDevice = async (ip: string, rooms: any, devices: any): Promise<any> => {
    try {
        const device = await discoverShelly(ip);
        const response = devices.data.devices[device.toLocaleLowerCase()];
        response.room = rooms.data.rooms[response.room_id]; // Assuming room_id exists in the response and maps to a room in shellyRooms
        logger.info(`[server]: Discovered device at ${ip}: ${JSON.stringify(response.name)}`);
        return response;

    } catch (error: Error | any) {
        logger.info(`[server]: Failed to discover device at ${ip}. Error: ${error.message}`);
    }
}