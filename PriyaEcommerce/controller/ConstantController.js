const {
  GetConstantsByCategory,
  GetAllConstants,
  GetConstantById,
  InsertConstant,
  UpdateConstant,
  DeleteConstant,
} = require("../Services/constantService");
const {
  logRequest,
  logSuccessResponse,
  logwarningResponse,
  logErrorResponse,
} = require("../../utils/logger");
const handleResponseError = require("../../utils/errorHandler");

const pageName = "Constant Controller";

/**
 * Get Constants by Category_Name (WHERE Category_Name = :categoryName)
 */
const GetByCategoryController = async (req, res) => {
  const method = "GetByCategory Controller";
  const categoryName =
    req.params.categoryName || req.query.Category_Name || req.query.category;
  try {
    logRequest(pageName, method, { Category_Name: categoryName });

    const data = await GetConstantsByCategory(categoryName);

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
 * Get All Constants
 */
const GetAllConstantsController = async (req, res) => {
  const method = "GetAllConstants Controller";
  try {
    logRequest(pageName, method, req.query);

    const data = await GetAllConstants(req.query);

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
 * Get Constant by Constant_SK
 */
const GetConstantByIdController = async (req, res) => {
  const method = "GetConstantById Controller";
  const constantSk = req.params.id;
  try {
    logRequest(pageName, method, { Constant_SK: constantSk });

    const data = await GetConstantById(constantSk);

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
 * Insert Constant
 */
const InsertConstantController = async (req, res) => {
  const method = "InsertConstant Controller";
  const constantData = req.body;
  try {
    logRequest(pageName, method, constantData);

    const data = await InsertConstant(constantData);

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
 * Update Constant
 */
const UpdateConstantController = async (req, res) => {
  const method = "UpdateConstant Controller";
  const constantSk = req.params.id;
  const updateData = req.body;
  try {
    logRequest(pageName, method, { constantSk, updateData });

    const data = await UpdateConstant(constantSk, updateData);

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
 * Delete / Deactivate Constant
 */
const DeleteConstantController = async (req, res) => {
  const method = "DeleteConstant Controller";
  const constantSk = req.params.id;
  const permanent = req.query.permanent === "true";
  try {
    logRequest(pageName, method, { constantSk, permanent });

    const data = await DeleteConstant(constantSk, permanent);

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

module.exports = {
  GetByCategoryController,
  GetAllConstantsController,
  GetConstantByIdController,
  InsertConstantController,
  UpdateConstantController,
  DeleteConstantController,
};
