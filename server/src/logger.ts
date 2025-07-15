import winston, { format, transports } from "winston";
import LokiTransport from "winston-loki";

export const logger = winston.createLogger({
  transports: [
    new transports.Console(),
    new transports.File({
      level: 'info',
      filename: 'logs/info.log'
    }),
    new transports.File({
      level: 'warn',
      filename: 'logs/warn.log'
    }),
    new transports.File({
      level: 'error',
      filename: 'logs/error.log'
    }),
    new LokiTransport({
      host: process.env.LOKI_URL || 'http://localhost:3100',
      labels: { app: 'shelly-host' },
      json: true,
    })
  ],
  format: format.combine(
    format.json(),
    format.timestamp(),
    format.metadata(),
    format.prettyPrint()
  )
});

export const logEnv = () => {
  const environment = [
    "PORT",
    "MQTT_URL",
    "CLIENT_URL",
    "SHELLY_CLOUD_AUTH_KEY",
    "VHOST_PREFIX"
  ].reduce((acc, key) => {
    acc[key.substring(0, 20).padStart(20, " ")] = process.env[key]?.substring(0, 60).padEnd(60, " ");
    return acc;
  }, {} as { [key: string]: string | undefined });
  environment["NODE_VERSION".padStart(20, " ")] = process.versions.node.padEnd(60, " ");
  logger.info("Environment: ");
  console.table(environment);
}