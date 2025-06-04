import winston, { format, transports } from "winston";

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
    ],
    format: format.combine(
      format.json(),
      format.timestamp(),
      format.metadata(),
      format.prettyPrint()
    )
  });