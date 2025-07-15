import "./App.css";
import IpAddressSetter from "./components/ip-address/IpAddressSetter";
import ShellyScanner from "./components/shelly-scanner/ShellyScanner";

function App() {
    return (
        <>
            <IpAddressSetter />
            <ShellyScanner />
        </>
    );
}

export default App;
