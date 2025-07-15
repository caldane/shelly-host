//327
const viteEnv = (window as Window).env || import.meta.env || {};

const getEnv = (key: keyof RuntimeEnv, defaultValue?: string): string => {
    if (viteEnv[key] === undefined) {
        if (defaultValue === undefined) {
            throw new Error(`Environment variable ${key} is not defined`);
        }
        console.warn(`Environment variable ${key} is not defined, using default value: ${defaultValue}`);
        return defaultValue;
    }
    console.log(`Using environment variable ${key}=${viteEnv[key]}`);
    return viteEnv[key];
};

export const BACKEND_URL = getEnv("VITE_APP_BACKEND");
export const APP_NAME = getEnv("VITE_APP_NAME");