import { FormEvent, useEffect, useMemo, useState } from "react";
import { BACKEND_URL } from "../../constants/env";
import style from "./configuration-page.module.css";

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

const ConfigurationPage = () => {
    const [ipAddresses, setIpAddresses] = useState<string[]>([]);
    const [ipAddressInput, setIpAddressInput] = useState("");
    const [search, setSearch] = useState("");
    const [statusMessage, setStatusMessage] = useState("");

    const loadIpAddresses = async (searchTerm?: string) => {
        const query = searchTerm ? `?search=${encodeURIComponent(searchTerm)}` : "";
        const response = await fetch(`${BACKEND_URL}/configuration/ip-addresses${query}`);
        if (!response.ok) {
            throw new Error("Failed to load configuration ranges");
        }

        const data: { ipAddresses: string[] } = await response.json();
        setIpAddresses(data.ipAddresses || []);
    };

    useEffect(() => {
        loadIpAddresses().catch((error: Error) => setStatusMessage(error.message));
    }, []);

    useEffect(() => {
        const timeout = setTimeout(() => {
            loadIpAddresses(search).catch((error: Error) => setStatusMessage(error.message));
        }, 250);

        return () => clearTimeout(timeout);
    }, [search]);

    const inputPrefix = useMemo(() => toPrefix(ipAddressInput), [ipAddressInput]);

    const handleAddIpAddress = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!inputPrefix) {
            setStatusMessage("Enter a valid IPv4 address. It will be saved as x.x.x.0");
            return;
        }

        const response = await fetch(`${BACKEND_URL}/configuration/ip-addresses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ipAddress: inputPrefix }),
        });

        if (!response.ok) {
            setStatusMessage("Failed to add scan range");
            return;
        }

        const data: { ipAddresses: string[] } = await response.json();
        setIpAddresses(data.ipAddresses || []);
        setIpAddressInput("");
        setStatusMessage(`Saved ${inputPrefix}`);
    };

    const handleDelete = async (ipAddress: string) => {
        const response = await fetch(`${BACKEND_URL}/configuration/ip-addresses/${encodeURIComponent(ipAddress)}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            setStatusMessage("Failed to remove scan range");
            return;
        }

        const data: { ipAddresses: string[] } = await response.json();
        setIpAddresses(data.ipAddresses || []);
        setStatusMessage(`Removed ${ipAddress}`);
    };

    return (
        <section className={style["configuration-page"]}>
            <header>
                <h2>Allowed Scan Ranges</h2>
                <p>Manage network prefixes used for discovery scans.</p>
            </header>

            <article>
                <form onSubmit={handleAddIpAddress}>
                    <label htmlFor="ipAddress">IP Address or Prefix</label>
                    <input
                        id="ipAddress"
                        type="text"
                        value={ipAddressInput}
                        onChange={(event) => setIpAddressInput(event.target.value)}
                        placeholder="192.168.1.9"
                    />
                    <button type="submit">Save Prefix</button>
                </form>
                <aside>
                    <p>Prefix Preview: {inputPrefix || "Invalid IP"}</p>
                    <label htmlFor="search">Search</label>
                    <input id="search" type="text" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="10.10" />
                </aside>
            </article>

            <article>
                <ul>
                    {ipAddresses.map((ipAddress) => (
                        <li key={ipAddress}>
                            <span>{ipAddress}</span>
                            <button type="button" onClick={() => handleDelete(ipAddress)}>
                                Remove
                            </button>
                        </li>
                    ))}
                </ul>
                {statusMessage ? <p>{statusMessage}</p> : null}
            </article>
        </section>
    );
};

export default ConfigurationPage;
