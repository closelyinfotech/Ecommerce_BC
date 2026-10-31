const bcrypt = require("bcryptjs");
const { supabase } = require("../../config/supabase");
const handleResponseError = require("../../utils/errorHandler");
const { validateUpdate } = require("../models/userValidation");

/**
 * Execute sp_userlogindetails_get RPC with fallback to direct table query
 */
const spUserLoginDetailsGet = async ({ p_user_sk = null, p_username = null, p_userby = null, p_mode }) => {
  try {
    // 1. Try calling the Supabase stored function
    const { data, error } = await supabase.rpc("sp_userlogindetails_get", {
      p_user_sk,
      p_username,
      p_userby,
      p_mode,
    });

    if (!error && data !== null) {
      if (data && data.status === 0 && data.errorMessage) {
        throw { message: data.errorMessage, statusCode: 404 };
      }
      return data;
    }

    // 2. Fallback to direct table query if RPC is not deployed yet or returned 42883 (undefined function)
    if (error && (error.code === "42883" || error.code === "PGRST202")) {
      return await directTableGetFallback({ p_user_sk, p_username, p_mode });
    }

    if (error) throw error;
    return data;
  } catch (err) {
    if (err.statusCode || err.Fieldvld) throw err;
    // Attempt fallback query
    return await directTableGetFallback({ p_user_sk, p_username, p_mode });
  }
};

/**
 * Direct table query fallback for GET operations
 */
const directTableGetFallback = async ({ p_user_sk, p_username, p_mode }) => {
  let query = supabase.from("tbl_userlogindetails").select(
    "user_sk, username, mobileno, isactive, createdby, createddate, modifiedby, modifieddate"
  );

  if (p_mode === "GetbyId" || p_mode === "GETBYID") {
    const { data, error } = await query.eq("user_sk", p_user_sk).single();
    if (error || !data) throw { message: "User Details Not Exists", statusCode: 404 };
    return data;
  }

  if (p_mode === "SearchUser") {
    const { data, error } = await query.ilike("username", `%${p_username || ""}%`).order("user_sk", { ascending: false });
    if (error || !data || data.length === 0) throw { message: "User Details Not Exists", statusCode: 404 };
    return data;
  }

  // Default: GetAll
  const { data, error } = await query.order("user_sk", { ascending: false });
  if (error) throw error;
  return data || [];
};

/**
 * Execute sp_userlogindetails_trans RPC with fallback to direct table operation
 */
const spUserLoginDetailsTrans = async ({
  p_user_sk = null,
  p_username = null,
  p_passwordenc = null,
  p_password = null,
  p_mobileno = null,
  p_isactive = true,
  p_userby = null,
  p_mode,
}) => {
  try {
    const { data, error } = await supabase.rpc("sp_userlogindetails_trans", {
      p_user_sk,
      p_username,
      p_passwordenc,
      p_password,
      p_mobileno,
      p_isactive,
      p_userby,
      p_mode,
    });

    if (!error && data !== null) {
      if (data && data.Status === 0) {
        throw { message: data.Message || "Operation failed", statusCode: 400 };
      }
      return data;
    }

    // Fallback if RPC doesn't exist
    if (error && (error.code === "42883" || error.code === "PGRST202")) {
      return await directTableTransFallback({
        p_user_sk,
        p_username,
        p_passwordenc,
        p_password,
        p_mobileno,
        p_isactive,
        p_userby,
        p_mode,
      });
    }

    if (error) throw error;
    return data;
  } catch (err) {
    if (err.statusCode || err.Fieldvld) throw err;
    return await directTableTransFallback({
      p_user_sk,
      p_username,
      p_passwordenc,
      p_password,
      p_mobileno,
      p_isactive,
      p_userby,
      p_mode,
    });
  }
};

/**
 * Direct table transaction fallback
 */
const directTableTransFallback = async ({
  p_user_sk,
  p_username,
  p_passwordenc,
  p_password,
  p_mobileno,
  p_isactive,
  p_userby,
  p_mode,
}) => {
  const mode = (p_mode || "").toUpperCase();

  if (mode === "INSERT") {
    const { data, error } = await supabase
      .from("tbl_userlogindetails")
      .insert([
        {
          username: p_username,
          passwordenc: p_passwordenc,
          password: p_password,
          mobileno: p_mobileno,
          isactive: p_isactive !== undefined ? p_isactive : true,
          createdby: p_userby,
          createddate: new Date().toISOString(),
        },
      ])
      .select("user_sk")
      .single();

    if (error) throw error;
    return {
      Status: 1,
      Message: "User inserted successfully",
      User_SK: data.user_sk,
    };
  }

  if (mode === "UPDATE") {
    const updatePayload = {
      modifiedby: p_userby,
      modifieddate: new Date().toISOString(),
    };
    if (p_username) updatePayload.username = p_username;
    if (p_passwordenc) updatePayload.passwordenc = p_passwordenc;
    if (p_password) updatePayload.password = p_password;
    if (p_mobileno !== undefined) updatePayload.mobileno = p_mobileno;
    if (p_isactive !== undefined) updatePayload.isactive = p_isactive;

    const { data, error } = await supabase
      .from("tbl_userlogindetails")
      .update(updatePayload)
      .eq("user_sk", p_user_sk)
      .select("user_sk")
      .single();

    if (error || !data) throw { message: "User not found", statusCode: 404 };
    return { Status: 1, Message: "User updated successfully" };
  }

  if (mode === "DELETE") {
    const { data, error } = await supabase
      .from("tbl_userlogindetails")
      .delete()
      .eq("user_sk", p_user_sk)
      .select("user_sk")
      .single();

    if (error || !data) throw { message: "User not found", statusCode: 404 };
    return { Status: 1, Message: "User deleted successfully" };
  }

  throw { message: "Invalid Mode", statusCode: 400 };
};

// =====================================================================
// Public Service Methods
// =====================================================================

/**
 * Get all user login details (Mode: 'GetAll')
 */
const GetAllUsers = async () => {
  try {
    const result = await spUserLoginDetailsGet({ p_mode: "GetAll" });
    return result;
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Get user by User_SK (Mode: 'GetbyId')
 */
const GetUserById = async (userSk) => {
  try {
    if (!userSk) throw { Fieldvld: 1, message: "User_SK is required" };
    const result = await spUserLoginDetailsGet({
      p_user_sk: userSk,
      p_mode: "GetbyId",
    });
    return result;
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Search user by Username (Mode: 'SearchUser')
 */
const SearchUser = async (username) => {
  try {
    if (!username) throw { Fieldvld: 1, message: "Username is required to search" };
    const result = await spUserLoginDetailsGet({
      p_username: username,
      p_mode: "SearchUser",
    });
    return result;
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Insert new user (Mode: 'INSERT')
 */
const InsertUser = async (userData) => {
  try {
    const username = userData.Username || userData.username;
    const rawPassword = userData.Password || userData.password;
    const mobileno = userData.MobileNo || userData.mobileno;
    const userBy = userData.UserBy || userData.Createdby || "System";
    const isActive = userData.IsActive !== undefined ? userData.IsActive : true;

    // Hash password for PasswordEnc
    let passwordEnc = userData.PasswordEnc || userData.passwordenc;
    if (!passwordEnc && rawPassword) {
      const salt = await bcrypt.genSalt(10);
      passwordEnc = await bcrypt.hash(rawPassword, salt);
    }

    const result = await spUserLoginDetailsTrans({
      p_username: username,
      p_passwordenc: passwordEnc,
      p_password: rawPassword,
      p_mobileno: mobileno,
      p_isactive: isActive,
      p_userby: userBy,
      p_mode: "INSERT",
    });

    return result;
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Update user details (Mode: 'UPDATE')
 */
const UpdateUserDetails = async (userSk, updateData) => {
  try {
    if (!userSk) throw { Fieldvld: 1, message: "User_SK is required" };

    const validation = validateUpdate(updateData);
    if (!validation.isValid) throw { Fieldvld: 1, message: validation.message };

    const username = updateData.Username || updateData.username;
    const rawPassword = updateData.Password || updateData.password;
    const mobileno = updateData.MobileNo || updateData.mobileno;
    const userBy = updateData.UserBy || updateData.Modifiedby || "System";
    const isActive = updateData.IsActive !== undefined ? updateData.IsActive : true;

    let passwordEnc = updateData.PasswordEnc || updateData.passwordenc;
    if (!passwordEnc && rawPassword) {
      const salt = await bcrypt.genSalt(10);
      passwordEnc = await bcrypt.hash(rawPassword, salt);
    }

    const result = await spUserLoginDetailsTrans({
      p_user_sk: userSk,
      p_username: username,
      p_passwordenc: passwordEnc,
      p_password: rawPassword,
      p_mobileno: mobileno,
      p_isactive: isActive,
      p_userby: userBy,
      p_mode: "UPDATE",
    });

    return result;
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Delete user by User_SK (Mode: 'DELETE')
 */
const DeleteUserDetails = async (userSk) => {
  try {
    if (!userSk) throw { Fieldvld: 1, message: "User_SK is required" };

    const result = await spUserLoginDetailsTrans({
      p_user_sk: userSk,
      p_mode: "DELETE",
    });

    return result;
  } catch (error) {
    throw handleResponseError(error);
  }
};

module.exports = {
  GetAllUsers,
  GetUserById,
  SearchUser,
  InsertUser,
  UpdateUserDetails,
  DeleteUserDetails,
  spUserLoginDetailsGet,
  spUserLoginDetailsTrans,
};
