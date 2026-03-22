const logger = require('../config/logger');

const isProduction = () => process.env.NODE_ENV === 'production';

const buildServerErrorPayload = ({
  clientMessage = 'Internal server error',
  field = 'error',
  err,
  developmentDetails,
  extra = {}
} = {}) => {
  const payload = {
    ...extra,
    [field]: clientMessage
  };

  if (!isProduction()) {
    if (typeof developmentDetails !== 'undefined') {
      payload.details = developmentDetails;
    } else if (err?.message) {
      payload.details = err.message;
    }
  }

  return payload;
};

const sendServerError = (
  res,
  err,
  {
    status = 500,
    logMessage = 'Unhandled server error',
    clientMessage = 'Internal server error',
    field = 'error',
    extra = {},
    developmentDetails,
    logExtra = {},
    loggerInstance = logger
  } = {}
) => {
  const logPayload = {
    error: err?.message,
    stack: err?.stack,
    ...logExtra
  };

  if (loggerInstance?.error) {
    loggerInstance.error(logMessage, logPayload);
  } else {
    console.error(logMessage, logPayload);
  }

  return res.status(status).json(
    buildServerErrorPayload({
      clientMessage,
      field,
      err,
      developmentDetails,
      extra
    })
  );
};

module.exports = {
  buildServerErrorPayload,
  sendServerError
};
