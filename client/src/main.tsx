import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store/store";

console.log("Starting Shelly Host Client...");
import { BACKEND_URL } from "./constants/env.ts";
console.log(`Connecting to backend at: ${BACKEND_URL}`);

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </StrictMode>
);
