import { useMemo, useState } from "react";
import { BACKEND_URL } from "../../constants/env";
import ShellyScanner from "../shelly-scanner/ShellyScanner";
import style from "./scanner-page.module.css";

const toPrefix = (value: string) => {
    const segments = value.trim().split(".");
    if (segments.length !== 4) {
        return "";
    }

    const parsed = segments.map((segment) => Number(segment));
    if (parsed.some((segment) => Number.isNaN(segment) || segment < 0 || segment > 255)) {
        return "";
    }

    return `${parsed[0]}.${parsed[1]}.${parsed[2]}.0`;
};

const ScannerPage = () => {
    const [inputValue, setInputValue] = useState("192.168.1.1");
    const [scanIpAddress, setScanIpAddress] = useState("192.168.1.1");
    const [statusMessage, setStatusMessage] = useState("");

    const ipPrefix = useMemo(() => toPrefix(inputValue), [inputValue]);

    const handleSavePrefix = async () => {
        if (!ipPrefix) {
            setStatusMessage("Enter a valid IPv4 address to save a prefix");
            return;
        }

        const response = await fetch(`${BACKEND_URL}/configuration/ip-addresses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ipAddress: ipPrefix }),
        });

        if (!response.ok) {
            setStatusMessage("Failed to save prefix to Mongo");
            return;
        }

        setStatusMessage(`Saved prefix ${ipPrefix}`);
    };

    const handleStartScan = () => {
        setScanIpAddress(inputValue.trim());
    };

    return (
        <section className={style["scanner-page"]}>
            <header>
                <h2>Network Scanner</h2>
                <p>Scan from an IP and optionally store that prefix as an allowed Mongo scan range.</p>
            </header>

            <article>
                <label htmlFor="scan-ip">Scan IP Address</label>
                <input id="scan-ip" type="text" value={inputValue} onChange={(event) => setInputValue(event.target.value)} />
                <p>Prefix Preview: {ipPrefix || "Invalid IP"}</p>
                <aside>
                    <button type="button" onClick={handleStartScan}>
                        Start Scan
                    </button>
                    <button type="button" onClick={handleSavePrefix}>
                        Save Prefix
                    </button>
                </aside>
                {statusMessage ? <p>{statusMessage}</p> : null}
            </article>

            <ShellyScanner ipAddress={scanIpAddress} />
        </section>
    );
};

export default ScannerPage;
