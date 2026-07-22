import "./App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/app-shell/app-shell";
import ConfigurationPage from "./components/configuration-page/configuration-page";
import LandingPage from "./components/landing-page/landing-page";
import ScannerPage from "./components/scanner-page/scanner-page";
import SwitchesPage from "./components/switches-page/switches-page";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AppShell />}>
                    <Route index element={<LandingPage />} />
                    <Route path="scanner" element={<ScannerPage />} />
                    <Route path="configuration" element={<ConfigurationPage />} />
                    <Route path="switches" element={<SwitchesPage />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
