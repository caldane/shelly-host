interface RuntimeEnv {
  VITE_APP_BACKEND: string;
  VITE_APP_NAME: string;
}

interface Window {
  env: RuntimeEnv;
}