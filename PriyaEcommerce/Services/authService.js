const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { supabase } = require("../../config/supabase");
const config = require("../../config");
const handleResponseError = require("../../utils/errorHandler");
const { validateRegister, validateLogin } = require("../models/userValidation");
const { InsertUser } = require("./userService");

/**
 * Generate a signed JWT token
 */
const generateJwtToken = (payload) => {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn || "24h",
  });
};

/**
 * Register User into tbl_userlogindetails
 */
const RegisterUser = async (userData) => {
  try {
    const validation = validateRegister(userData);
    if (!validation.isValid) {
      throw { Fieldvld: 1, message: validation.message };
    }

    const username = (userData.Username || userData.username).trim();
    const password = userData.Password || userData.password;
    const mobileno = (userData.MobileNo || userData.mobileno || "").trim();
    const userBy = userData.UserBy || userData.Createdby || "Self";

    // 1. Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("tbl_userlogindetails")
      .select("user_sk, username, mobileno")
      .eq("username", username)
      .limit(1);

    if (existingUser && existingUser.length > 0) {
      throw {
        message: "An account with this Username already exists.",
        statusCode: 409,
      };
    }

    // 2. Hash password for PasswordEnc
    const salt = await bcrypt.genSalt(10);
    const passwordEnc = await bcrypt.hash(password, salt);

    // 3. Insert record via sp_userlogindetails_trans (INSERT)
    const insertResult = await InsertUser({
      Username: username,
      PasswordEnc: passwordEnc,
      Password: password,
      MobileNo: mobileno,
      IsActive: true,
      UserBy: userBy,
    });

    const userSk = insertResult.User_SK;

    // 4. Issue JWT Token
    const tokenPayload = {
      User_SK: userSk,
      Username: username,
      MobileNo: mobileno,
    };
    const accessToken = generateJwtToken(tokenPayload);

    return {
      user: {
        User_SK: userSk,
        Username: username,
        MobileNo: mobileno,
        IsActive: true,
      },
      accessToken,
      tokenType: "Bearer",
      expiresIn: config.jwt.expiresIn,
    };
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Login User from tbl_userlogindetails
 */
const LoginUser = async (credentials) => {
  try {
    const validation = validateLogin(credentials);
    if (!validation.isValid) {
      throw { Fieldvld: 1, message: validation.message };
    }

    const identifier = (credentials.Username || credentials.username || credentials.MobileNo || credentials.mobileno || "").trim();
    const password = credentials.Password || credentials.password;

    // 1. Fetch user by username or mobileno
    const { data: users, error: fetchError } = await supabase
      .from("tbl_userlogindetails")
      .select("user_sk, username, passwordenc, password, mobileno, isactive")
      .or(`username.eq.${identifier},mobileno.eq.${identifier}`)
      .limit(1);

    if (fetchError) throw fetchError;

    const user = users && users[0];
    if (!user) {
      throw {
        message: "Invalid credentials: User does not exist",
        statusCode: 401,
      };
    }

    // 2. Check active flag
    if (user.isactive === false) {
      throw {
        message: "Account has been deactivated. Please contact support.",
        statusCode: 403,
      };
    }

    // 3. Verify password (check passwordenc first, fallback to raw password)
    let isPasswordValid = false;
    if (user.passwordenc) {
      isPasswordValid = await bcrypt.compare(password, user.passwordenc);
    }
    if (!isPasswordValid && user.password) {
      isPasswordValid = user.password === password;
    }

    if (!isPasswordValid) {
      throw {
        message: "Invalid credentials: Password incorrect",
        statusCode: 401,
      };
    }

    // 4. Issue JWT Token
    const tokenPayload = {
      User_SK: user.user_sk,
      Username: user.username,
      MobileNo: user.mobileno,
    };
    const accessToken = generateJwtToken(tokenPayload);

    return {
      user: {
        User_SK: user.user_sk,
        Username: user.username,
        MobileNo: user.mobileno,
        IsActive: user.isactive,
      },
      accessToken,
      tokenType: "Bearer",
      expiresIn: config.jwt.expiresIn,
    };
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Quick direct token issuance
 */
const IssueDirectToken = async (clientData, origin) => {
  try {
    const allowedOrigins = config.allowedOrigins;
    const isTrustedFrontend = allowedOrigins.some(
      (allowed) => origin && origin.startsWith(allowed)
    );

    if (!isTrustedFrontend) {
      const { username, password } = clientData || {};
      if (
        !username ||
        !password ||
        username !== config.user.username ||
        password !== config.user.password
      ) {
        throw { message: "Invalid API credentials", statusCode: 401 };
      }
    }

    const tokenPayload = {
      Username: clientData?.username || config.user.username,
      Role: "ApiConsumer",
      iss: "PriyaCoutureAuth",
    };

    const token = generateJwtToken(tokenPayload);
    return {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn: config.jwt.expiresIn,
    };
  } catch (error) {
    throw handleResponseError(error);
  }
};

module.exports = {
  RegisterUser,
  LoginUser,
  IssueDirectToken,
  generateJwtToken,
};
