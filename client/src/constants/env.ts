//327
const getEnv = (key: string, defaultValue?: string): string => {
    if (import.meta.env[key] === undefined) {
        if (defaultValue === undefined) {
            throw new Error(`Environment variable ${key} is not defined`);
        }
        return defaultValue;
    }
    return import.meta.env[key];
};

export const BACKEND_URL = getEnv("VITE_APP_BACKEND");
export const APP_NAME = getEnv("VITE_APP_NAME");