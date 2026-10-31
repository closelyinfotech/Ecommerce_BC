const winston = require("winston");
const dayjs = require("dayjs");
const fs = require("fs-extra");
const path = require("path");

function getLogDirectory(pageName) {
  const currentYear = dayjs().format("YYYY");
  const currentMonth = dayjs().format("MM");
  const currentDate = dayjs().format("DD");

  const logDir = path.join(
    __dirname,
    "..",
    "logs",
    pageName,
    currentYear,
    currentMonth,
    currentDate
  );

  // Ensure directory exists
  fs.ensureDirSync(logDir);
  return logDir;
}

const customLogFormat = winston.format.printf(({ timestamp, message }) => {
  return JSON.stringify({
    timestamp: timestamp,
    level: message.level,
    ApiMethodName: message.ApiMessage,
    code: message.code,
    numberOfRecords: message.numberOfRecords,
    data: message.data || {},
  });
});

function createPageLogger(pageName) {
  const logDirectory = getLogDirectory(pageName);

  return winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      customLogFormat
    ),
    transports: [
      new winston.transports.File({
        filename: path.join(logDirectory, `${pageName}.log`),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.json(),
          customLogFormat
        ),
      }),
      new winston.transports.Console({
        level: "info",
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        ),
      }),
    ],
  });
}

const logSuccessResponse = (pageName, method, response) => {
  const logger = createPageLogger(pageName);

  const logData = {
    level: "SuccessResponse",
    ApiMessage: method,
    code: 200,
    numberOfRecords: response?.data?.numberOfRecords || (Array.isArray(response?.data) ? response.data.length : 1),
    data: response?.data || response || {},
  };
  logger.info(logData);
};

const logErrorResponse = (pageName, method, res) => {
  const logger = createPageLogger(pageName);

  const logData = {
    level: "ErrorResponse",
    ApiMessage: method,
    code: res?.error?.errorCode || res?.statusCode || 500,
    data:
      res?.response?.data !== null && res?.response?.data !== undefined
        ? res.response.data
        : res?.message !== null && res?.message !== undefined
        ? res.message
        : res?.data !== null && res?.data !== undefined
        ? res.data
        : res !== null && res !== undefined
        ? res
        : res?.error !== null && res?.error !== undefined
        ? res.error
        : {},
  };
  logger.error(logData);
};

const logRequest = (pageName, method, res) => {
  const logger = createPageLogger(pageName);

  const logData = {
    level: "RequestResponse",
    ApiMessage: method,
    data: res || {},
  };
  logger.info(logData);
};

const logwarningResponse = (pageName, method, res) => {
  const logger = createPageLogger(pageName);

  const logData = {
    level: "WarningResponse",
    ApiMessage: method,
    data: res?.data || res || {},
  };

  logger.warn(logData);
};

module.exports = {
  logSuccessResponse,
  logErrorResponse,
  logRequest,
  logwarningResponse,
};
