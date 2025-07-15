import { useDispatch } from "react-redux";
import { useState } from "react";
import { setIpAddress } from "../../store/scannerSlice";

const IpAddressSetter = () => {
  const dispatch = useDispatch();
  const [inputValue, setInputValue] = useState("");

  // IPv4 regex
  const ipRegex = /^(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.trim();
    setInputValue(value);

    if (ipRegex.test(value)) {
      dispatch(setIpAddress(value));
    }
  };

  return (
    <section>
      <input
        type="text"
        placeholder="Enter IP Address"
        value={inputValue}
        onChange={handleChange}
      />
    </section>
  );
};

export default IpAddressSetter;
