import { NavLink, Outlet } from "react-router-dom";
import { APP_NAME } from "../../constants/env";
import style from "./app-shell.module.css";

const AppShell = () => {
    return (
        <section className={style["app-shell"]}>
            <header>
                <h1>{APP_NAME}</h1>
                <nav>
                    <NavLink to="/" end>
                        Home
                    </NavLink>
                    <NavLink to="/scanner">Scanner</NavLink>
                    <NavLink to="/configuration">Config Ranges</NavLink>
                    <NavLink to="/switches">Switches</NavLink>
                </nav>
            </header>
            <article>
                <Outlet />
            </article>
        </section>
    );
};

export default AppShell;
