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