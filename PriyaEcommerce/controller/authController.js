const {
  RegisterUser,
  LoginUser,
  IssueDirectToken,
} = require("../Services/authService");
const {
  logRequest,
  logSuccessResponse,
  logwarningResponse,
  logErrorResponse,
} = require("../../utils/logger");
const handleResponseError = require("../../utils/errorHandler");

const pageName = "Auth Controller";

/**
 * Register User Controller
 */
const Register = async (req, res) => {
  const method = "Register Controller";
  const userData = req.body;
  try {
    // Exclude password from log for security
    const sanitizedLog = { ...userData };
    delete sanitizedLog.Password;
    logRequest(pageName, method, sanitizedLog);

    const data = await RegisterUser(userData);

    logSuccessResponse(pageName, method, data);
    const _response = {
      code: 1,
      status: "Success",
      data: { model: data },
    };
    return res.status(201).json(_response);
  } catch (error) {
    logErrorResponse(pageName, method, error);
    const Errordata =
      error?.body?.code === 0 ? error : handleResponseError(error);
    return res.status(Errordata.statusCode || 500).json(Errordata.body);
  }
};

/**
 * Login User Controller
 */
const Login = async (req, res) => {
  const method = "Login Controller";
  const credentials = req.body;
  try {
    const sanitizedLog = { ...credentials };
    delete sanitizedLog.Password;
    logRequest(pageName, method, sanitizedLog);

    const data = await LoginUser(credentials);

    logSuccessResponse(pageName, method, {
      user: data.user,
      tokenIssued: true,
    });
    const _response = {
      code: 1,
      status: "Success",
      data: { model: data },
    };
    return res.status(200).json(_response);
  } catch (error) {
    logErrorResponse(pageName, method, error);
    const Errordata =
      error?.body?.code === 0 ? error : handleResponseError(error);
    return res.status(Errordata.statusCode || 500).json(Errordata.body);
  }
};

/**
 * Direct Token Issue Controller (Life-Broker compatibility)
 */
const IssueToken = async (req, res) => {
  const method = "IssueToken Controller";
  const origin = req.headers.origin || req.headers.referer || "";
  try {
    logRequest(pageName, method, { origin });

    const data = await IssueDirectToken(req.body, origin);

    logSuccessResponse(pageName, method, data);
    return res.status(200).json(data);
  } catch (error) {
    logErrorResponse(pageName, method, error);
    const Errordata =
      error?.body?.code === 0 ? error : handleResponseError(error);
    return res.status(Errordata.statusCode || 500).json(Errordata.body);
  }
};

module.exports = {
  Register,
  Login,
  IssueToken,
};
