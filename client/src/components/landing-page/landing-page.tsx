import { Link } from "react-router-dom";
import style from "./landing-page.module.css";

const tiles = [
    {
        title: "Scanner",
        description: "Run discovery scans and save new network prefixes to Mongo from the scanner page.",
        to: "/scanner",
    },
    {
        title: "Config Ranges",
        description: "Manage allowed scan prefixes that power discovery ranges.",
        to: "/configuration",
    },
    {
        title: "Switches",
        description: "Navigate directly to switches sourced from Mongo site data and trigger actions.",
        to: "/switches",
    },
];

const LandingPage = () => {
    return (
        <section className={style["landing-page"]}>
            <header>
                <h2>Control Center</h2>
                <p>Pick a workspace below to configure scan targets, run discovery, or jump to switches.</p>
            </header>
            <article>
                {tiles.map((tile) => (
                    <section key={tile.title}>
                        <h3>{tile.title}</h3>
                        <p>{tile.description}</p>
                        <Link to={tile.to}>Open {tile.title}</Link>
                    </section>
                ))}
            </article>
        </section>
    );
};

export default LandingPage;
