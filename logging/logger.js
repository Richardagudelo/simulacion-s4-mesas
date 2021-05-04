const { createLogger, transports, format } = require('winston');
const { combine } = format;

const logsFileName = `${__dirname}/logmesas.log`;

/**
 * Constante de formato para el log en consola
 */
const consoleFormat = combine(
	format.colorize(),
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.printf((info) => `${info.level}: ${info.timestamp} - ${info.message}`)
);

/**
 * Constante formato de log para archivo
 */
const fileFormat = combine(
	format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
	format.printf((info) => `${info.level.toUpperCase()}: ${info.timestamp} - ${info.message}`)
);

/**
 * Creacion del objeto para logs, tanto archivo como consola
 * Info: logs de info
 * Errors: logs de error
 */
const logger = createLogger({
	transports: [
		new transports.Console({
			level: 'info',
			format: consoleFormat,
		}),
		new transports.Console({
			level: 'error',
			format: consoleFormat,
		}),
		new transports.File({
			filename: logsFileName,
			level: 'info',
			format: fileFormat,
		}),
		new transports.File({
			filename: logsFileName,
			level: 'error',
			format: fileFormat,
		}),
	],
});

module.exports = logger;
