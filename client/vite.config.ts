import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// Log all VITE_* environment variables
console.log('Logging VITE_* environment variables:');
Object.entries(process.env)
  .filter(([key]) => key.startsWith('VITE_'))
  .forEach(([key, val]) => console.log(`${key}=${val}`));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 4501,
    host: true,
    watch: {
      usePolling: true,
    }
  },
})
