import { useEffect, useState } from "react";
import style from "./shelly-scanner.module.css";
import ProgressBar from "../progress-bar/ProgressBar";
import { BACKEND_URL } from "../../constants/env";
import ShellyEntity from "../shelly-entity/ShellyEntity";
import { IDevice } from "../../../../common/models/device.interface";

type ShellyScannerProps = {
    ipAddress: string;
};

const ShellyScanner = ({ ipAddress }: ShellyScannerProps) => {
    const [progress, setProgress] = useState(0);
    const [total, setTotal] = useState<number | null>(null);
    const [count, setCount] = useState(0);
    const [devices, setDevices] = useState<IDevice[]>([]);
    const [mode, setMode] = useState<string>("dev");

    useEffect(() => {
        const handleKeyPress = (() => {
            let buffer = "";

            return (e: KeyboardEvent) => {
                buffer += e.key.toLowerCase();

                // Keep buffer to last 5 characters
                if (buffer.length > 10) {
                    buffer = buffer.slice(buffer.length - 10);
                }

                if (buffer.includes("debug")) {
                    setMode("debug");
                }

                if (buffer.includes("normal")) {
                    setMode("normal");
                }

                if (buffer.includes("dev")) {
                    setMode("dev");
                }

                if (buffer.includes("scan")) {
                    // Restart the scan
                }
            };
        })();

        window.addEventListener("keydown", handleKeyPress);
        return () => {
            window.removeEventListener("keydown", handleKeyPress);
        };
    }, []);

    useEffect(() => {
        const trimmedIp = ipAddress.trim();
        if (!trimmedIp) {
            console.warn("No IP address provided for Shelly scanner.");
            return;
        }

        console.log(`Starting Shelly scan on IP: ${trimmedIp}`);
        setProgress(0);
        setCount(0);
        setTotal(null);
        setDevices([]);

        const eventSource = new EventSource(`${BACKEND_URL}/shelly/discover?ip=${encodeURIComponent(trimmedIp)}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (typeof data.total === "number") {
                setTotal(data.total);
            }
            if (typeof data.count === "number") {
                setCount(data.count);
            }
            if (typeof data.completed === "number" && typeof data.total === "number" && data.total > 0) {
                setProgress((data.completed / data.total) * 100);
            }
            if (data.message === "Scan complete") {
                setDevices(data.devices);
                setProgress(100);
                eventSource.close();
            }
        };

        return () => {
            eventSource.close();
        };
    }, [ipAddress]);

    useEffect(() => {
        const eventSource = new EventSource(`${BACKEND_URL}/shelly/listen`);

        eventSource.onmessage = (event) => {
            const data: IDevice = JSON.parse(event.data);
            if (data.ip) {
                setDevices((currentDevices) => currentDevices.map((device) => (device.ip === data.ip ? data : device)));
            }
        };

        return () => {
            eventSource.close();
        };
    }, []);

    return (
        <section className={style["shelly-scanner"]}>
            <h2>Network Scanner</h2>
            <ProgressBar progress={progress} />
            <p>Progress: {total ? Math.round(progress) : "Loading..."}%</p>
            <p>Successful Responses: {count}</p>
            <article>
                {devices &&
                    devices
                        .sort((a, b) =>
                            (a?.room?.name || "Unknown").localeCompare(b?.room?.name || "Unknown", undefined, { sensitivity: "base" }) !== 0
                                ? (a?.room?.name || "Unknown").localeCompare(b?.room?.name || "Unknown", undefined, { sensitivity: "base" })
                                : a.name.localeCompare(b.name, undefined, { sensitivity: "base" })
                        )
                        .map((device, index) => <ShellyEntity key={`shelly-${index}`} device={device} mode={mode} />)}
            </article>
        </section>
    );
};

export default ShellyScanner;
