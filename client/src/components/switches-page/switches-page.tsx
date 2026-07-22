import { useEffect, useState } from "react";
import { BACKEND_URL } from "../../constants/env";
import style from "./switches-page.module.css";

interface SwitchItem {
    site: string;
    room: string;
    name: string;
    description: string;
    channel: number;
}

const encodePath = (value: string) => encodeURIComponent(value.toLowerCase().replace(/\s+/g, "-"));

const SwitchesPage = () => {
    const [switches, setSwitches] = useState<SwitchItem[]>([]);
    const [statusMessage, setStatusMessage] = useState("");

    useEffect(() => {
        fetch(`${BACKEND_URL}/site/switches`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Failed to load switches");
                }
                return response.json();
            })
            .then((data: { switches: SwitchItem[] }) => {
                setSwitches(data.switches || []);
            })
            .catch((error: Error) => {
                setStatusMessage(error.message);
            });
    }, []);

    const handleToggle = async (switchItem: SwitchItem) => {
        const url = `${BACKEND_URL}/site/${encodePath(switchItem.site)}/room/${encodePath(switchItem.room)}/device/${encodePath(switchItem.name)}/message/toggle/shelly`;
        const response = await fetch(url);

        if (!response.ok) {
            setStatusMessage(`Failed to toggle ${switchItem.name}`);
            return;
        }

        setStatusMessage(`Sent toggle for ${switchItem.site} / ${switchItem.room} / ${switchItem.name}`);
    };

    return (
        <section className={style["switches-page"]}>
            <header>
                <h2>Switches From Mongo</h2>
                <p>Each switch entry is generated from the Mongo-backed site collection.</p>
            </header>
            <article>
                <ul>
                    {switches.map((switchItem) => (
                        <li key={`${switchItem.site}-${switchItem.room}-${switchItem.name}`}>
                            <h3>
                                {switchItem.site} / {switchItem.room}
                            </h3>
                            <p>{switchItem.name}</p>
                            <p>{switchItem.description || "No description"}</p>
                            <aside>
                                <button type="button" onClick={() => handleToggle(switchItem)}>
                                    Toggle
                                </button>
                            </aside>
                        </li>
                    ))}
                </ul>
                {statusMessage ? <p>{statusMessage}</p> : null}
            </article>
        </section>
    );
};

export default SwitchesPage;
