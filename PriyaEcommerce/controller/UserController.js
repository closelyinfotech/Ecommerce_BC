const {
  GetAllUsers,
  GetUserById,
  SearchUser,
  InsertUser,
  UpdateUserDetails,
  DeleteUserDetails,
} = require("../Services/userService");
const {
  logRequest,
  logSuccessResponse,
  logwarningResponse,
  logErrorResponse,
} = require("../../utils/logger");
const handleResponseError = require("../../utils/errorHandler");

const pageName = "User Controller";

/**
 * Get All Users Controller (Mode: 'GetAll')
 */
const GetAllUsersController = async (req, res) => {
  const method = "GetAllUsers Controller";
  try {
    logRequest(pageName, method, req.query);

    const data = await GetAllUsers();

    logSuccessResponse(pageName, method, data);
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
 * Get User by ID Controller (Mode: 'GetbyId')
 */
const GetUserByIdController = async (req, res) => {
  const method = "GetUserById Controller";
  const userSk = req.params.id;
  try {
    logRequest(pageName, method, { User_SK: userSk });

    const data = await GetUserById(userSk);

    logSuccessResponse(pageName, method, data);
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
 * Search User Controller (Mode: 'SearchUser')
 */
const SearchUserController = async (req, res) => {
  const method = "SearchUser Controller";
  const username = req.query.username || req.query.name;
  try {
    logRequest(pageName, method, { username });

    const data = await SearchUser(username);

    logSuccessResponse(pageName, method, data);
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
 * Insert User Controller (Mode: 'INSERT')
 */
const InsertUserController = async (req, res) => {
  const method = "InsertUser Controller";
  const userData = req.body;
  try {
    const sanitizedLog = { ...userData };
    delete sanitizedLog.Password;
    delete sanitizedLog.PasswordEnc;
    logRequest(pageName, method, sanitizedLog);

    const data = await InsertUser(userData);

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
 * Update User Controller (Mode: 'UPDATE')
 */
const UpdateUserController = async (req, res) => {
  const method = "UpdateUser Controller";
  const userSk = req.params.id;
  const updateData = req.body;
  try {
    const sanitizedLog = { ...updateData };
    delete sanitizedLog.Password;
    delete sanitizedLog.PasswordEnc;
    logRequest(pageName, method, { userSk, sanitizedLog });

    const data = await UpdateUserDetails(userSk, updateData);

    logSuccessResponse(pageName, method, data);
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
 * Delete User Controller (Mode: 'DELETE')
 */
const DeleteUserController = async (req, res) => {
  const method = "DeleteUser Controller";
  const userSk = req.params.id;
  try {
    logRequest(pageName, method, { userSk });

    const data = await DeleteUserDetails(userSk);

    logSuccessResponse(pageName, method, data);
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
 * Get Profile Controller (Authenticated user via JWT)
 */
const GetProfileController = async (req, res) => {
  const method = "GetProfile Controller";
  try {
    const userPayload = req.user;
    logRequest(pageName, method, { User_SK: userPayload?.User_SK });

    let fullUser = null;
    if (userPayload?.User_SK) {
      try {
        fullUser = await GetUserById(userPayload.User_SK);
      } catch (e) {
        fullUser = userPayload;
      }
    }

    const result = fullUser || userPayload;
    logSuccessResponse(pageName, method, result);

    const _response = {
      code: 1,
      status: "Success",
      data: { model: result },
    };
    return res.status(200).json(_response);
  } catch (error) {
    logErrorResponse(pageName, method, error);
    const Errordata =
      error?.body?.code === 0 ? error : handleResponseError(error);
    return res.status(Errordata.statusCode || 500).json(Errordata.body);
  }
};

module.exports = {
  GetAllUsersController,
  GetUserByIdController,
  SearchUserController,
  InsertUserController,
  UpdateUserController,
  DeleteUserController,
  GetProfileController,
};
