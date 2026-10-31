// PriyaEcommerce/models/constantValidation.js

const validateConstantInsert = (data) => {
  const errors = [];

  const constantName = data.Constant_Name || data.constant_name || data.ConstantName;
  const categoryName = data.Category_Name || data.category_name || data.CategoryName;
  const constantValue = data.Constant_value !== undefined ? data.Constant_value : data.constant_value;

  if (!constantName || typeof constantName !== "string" || !constantName.trim()) {
    errors.push("Constant_Name is required and must be a non-empty string");
  }

  if (!categoryName || typeof categoryName !== "string" || !categoryName.trim()) {
    errors.push("Category_Name is required and must be a non-empty string");
  }

  if (constantValue !== undefined && constantValue !== null && isNaN(Number(constantValue))) {
    errors.push("Constant_value must be a valid integer or number");
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(", "),
    errors,
  };
};

const validateConstantUpdate = (data) => {
  const errors = [];
  const constantValue = data.Constant_value !== undefined ? data.Constant_value : data.constant_value;

  if (constantValue !== undefined && constantValue !== null && isNaN(Number(constantValue))) {
    errors.push("Constant_value must be a valid integer or number");
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(", "),
    errors,
  };
};

module.exports = {
  validateConstantInsert,
  validateConstantUpdate,
};
