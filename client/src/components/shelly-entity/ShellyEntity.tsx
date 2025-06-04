import { faCloudArrowUp, faCopy, faMessage, faObjectGroup, faPowerOff } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { IDevice } from "../../../../common/models/device.interface";
import { BACKEND_URL } from "../../constants/env";
import style from "./shelly-entity.module.css";

const TOGGLE_MESSAGE = { src: "buffington.action", method: "Switch.Toggle", params: { id: 0 } };
const SHELLY_HOST_URL = "http://192.168.1.200:4500";

const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    alert(`**Copied to clipboard**\n${label}:\n${text}`);
};

const ShellyEntity = ({ device, mode }: { device: IDevice; mode: string }) => {
    const [deviceEntity, setDeviceEntity] = useState(device);
    const [deviceName, setDeviceName] = useState(device.name.replace(/[^a-zA-Z0-9]/g, "-").toLocaleLowerCase());

    useEffect(() => {
        setDeviceEntity(device);
        setDeviceName(device.name.replace(/[^a-zA-Z0-9]/g, "-").toLocaleLowerCase());
    }, [device]);

    const activateMqtt = async (device: IDevice) => {
        const response = await fetch(`${BACKEND_URL}/shelly/${device.ip}/mqtt`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ device }),
        });
        if (response.ok) {
            const data = await response.json();
            setDeviceEntity(data);
            setDeviceName(data.name.replace(/[^a-zA-Z0-9]/g, "-").toLocaleLowerCase());
            console.log("MQTT activated successfully");
        } else {
            console.error("Failed to activate MQTT");
        }
    };

    const activateWebhook = async (device: IDevice) => {
        const response = await fetch(`${BACKEND_URL}/shelly/${device.ip}/webhook`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ device }),
        });
        if (response.ok) {
            const data = await response.json();
            setDeviceEntity(data);
            setDeviceName(data.name.replace(/[^a-zA-Z0-9]/g, "-").toLocaleLowerCase());
            console.log("Webhook activated successfully");
        } else {
            console.error("Failed to activate Webhook");
        }
    };

    const handleMqtt = async (device: IDevice) => {
        await activateMqtt(device);
        setDeviceEntity((prev) => ({ ...prev, mqtt: { ...prev.mqtt, enable: true } }));
    };

    const toggleMqtt = async (device: IDevice) => {
        const name = device.name.replace(/[^a-zA-Z0-9]/g, "-").toLocaleLowerCase();
        const response = await fetch(`${BACKEND_URL}/message/client/${name}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: { id: device.ip, ...TOGGLE_MESSAGE }, channel: device.mqtt.topic_prefix }),
        });

        if (response.ok) {
            console.log("MQTT toggled successfully");
        } else {
            console.error("Failed to toggle MQTT");
        }
    };

    return (
        <section className={style["shelly-entity"]} data-mqtt={deviceEntity.mqtt.enable ? "" : undefined} data-ip={deviceEntity.ip}>
            <h3 onClick={() => window.open(`http://${deviceEntity.ip}`, "_blank")}>{deviceEntity.name}</h3>
            <p>
                <b>IP Address:</b> {deviceEntity.ip}
            </p>
            <p>
                <b>Type:</b> {deviceEntity.type}
            </p>
            <p>
                <b>Room:</b> {deviceEntity.room?.name || "No room assigned"}
            </p>
            <p>
                <b>State:</b> {deviceEntity?.switchStatus?.output ? "On" : "Off"}
            </p>
            <p>
                {(mode == "debug" || mode == "dev") && (
                    <button onClick={() => handleMqtt(deviceEntity)}>
                        <b>MQTT:</b> {deviceEntity.mqtt.enable.toString()}
                    </button>
                )}
                {deviceEntity.mqtt.enable && (
                    <button onClick={() => toggleMqtt(deviceEntity)}>
                        <FontAwesomeIcon icon={faPowerOff} data-status={deviceEntity.switchStatus.output} />
                    </button>
                )}
            </p>
            {mode == "debug" && (
                <p className={style.tools}>
                    {deviceEntity.mqtt.enable && (
                        <button onClick={() => copy(`${deviceEntity.mqtt.topic_prefix}/rpc`, "MQTT Topic")} title="Copy MQTT Topic Prefix">
                            <FontAwesomeIcon icon={faMessage} />
                        </button>
                    )}
                    {deviceEntity.room !== undefined && deviceEntity.room.id && (
                        <button
                            title="Copy Webhook Url"
                            onClick={() =>
                                copy(
                                    `${SHELLY_HOST_URL}/api/message/srd/buffington/${deviceEntity?.room?.id}/${deviceName}/switch/message/toggle/shelly`,
                                    "Webhook Url"
                                )
                            }
                        >
                            <FontAwesomeIcon icon={faCopy} />
                        </button>
                    )}
                    {deviceEntity.webhooks && deviceEntity.webhooks.result.hooks.length > 0 && (
                        <button
                            onClick={() =>
                                copy(deviceEntity?.webhooks?.result.hooks.map((hook) => `${hook.name}:\n${hook.urls}`).join("\n\n") || "", "Active Webhooks:")
                            }
                            title="Webhook URLs"
                        >
                            <FontAwesomeIcon icon={faObjectGroup} />
                        </button>
                    )}
                    <button onClick={() => activateWebhook(deviceEntity)} title="Activate Webhook">
                        <FontAwesomeIcon icon={faCloudArrowUp} />
                    </button>
                </p>
            )}
        </section>
    );
};

export default ShellyEntity;
