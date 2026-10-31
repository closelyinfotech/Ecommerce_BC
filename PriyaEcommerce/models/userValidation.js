// PriyaEcommerce/models/userValidation.js

const validateRegister = (data) => {
  const errors = [];
  const username = data.Username || data.username || data.UserName;
  const password = data.Password || data.password;
  const mobileno = data.MobileNo || data.mobileno || data.MobileNumber;

  if (!username || typeof username !== "string" || !username.trim()) {
    errors.push("Username is required and cannot be empty");
  }

  if (!password || typeof password !== "string" || password.length < 4) {
    errors.push("Password is required and must be at least 4 characters long");
  }

  if (mobileno && (typeof mobileno !== "string" || mobileno.trim().length > 15)) {
    errors.push("MobileNo cannot exceed 15 digits");
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(", "),
    errors,
  };
};

const validateLogin = (data) => {
  const errors = [];
  const identifier = data.Username || data.username || data.MobileNo || data.mobileno;
  const password = data.Password || data.password;

  if (!identifier) {
    errors.push("Username or MobileNo is required for login");
  }

  if (!password) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(", "),
    errors,
  };
};

const validateUpdate = (data) => {
  const errors = [];
  const mobileno = data.MobileNo || data.mobileno || data.MobileNumber;

  if (mobileno && mobileno.trim().length > 15) {
    errors.push("MobileNo cannot exceed 15 digits");
  }

  return {
    isValid: errors.length === 0,
    message: errors.join(", "),
    errors,
  };
};

module.exports = {
  validateRegister,
  validateLogin,
  validateUpdate,
};
