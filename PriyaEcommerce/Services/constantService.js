const { supabase } = require("../../config/supabase");
const handleResponseError = require("../../utils/errorHandler");
const {
  validateConstantInsert,
  validateConstantUpdate,
} = require("../models/constantValidation");

/**
 * Get constants filtered by Category_Name (WHERE Category_Name = :categoryName)
 */
const GetConstantsByCategory = async (categoryName) => {
  try {
    if (!categoryName || !categoryName.trim()) {
      throw { Fieldvld: 1, message: "Category_Name parameter is required" };
    }

    const trimmedCategory = categoryName.trim();

    const { data, error } = await supabase
      .from("comconstant")
      .select(
        "constant_sk, constant_name, category_name, constant_value, isactive, createdby, createddate, modifiedby, modifieddate"
      )
      .ilike("category_name", trimmedCategory)
      .eq("isactive", true)
      .order("constant_value", { ascending: true })
      .order("constant_name", { ascending: true });

    if (error) throw error;

    return data || [];
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Get all constants with optional category filter
 */
const GetAllConstants = async (queryParams = {}) => {
  try {
    const { category, search, isActive } = queryParams;

    let query = supabase
      .from("comconstant")
      .select(
        "constant_sk, constant_name, category_name, constant_value, isactive, createdby, createddate, modifiedby, modifieddate"
      );

    if (category) {
      query = query.ilike("category_name", category.trim());
    }

    if (isActive !== undefined && isActive !== "") {
      const activeBool = isActive === "true" || isActive === true;
      query = query.eq("isactive", activeBool);
    }

    if (search) {
      query = query.or(
        `constant_name.ilike.%${search}%,category_name.ilike.%${search}%`
      );
    }

    query = query
      .order("category_name", { ascending: true })
      .order("constant_sk", { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Get single constant by Constant_SK
 */
const GetConstantById = async (constantSk) => {
  try {
    if (!constantSk) {
      throw { Fieldvld: 1, message: "Constant_SK is required" };
    }

    const { data, error } = await supabase
      .from("comconstant")
      .select(
        "constant_sk, constant_name, category_name, constant_value, isactive, createdby, createddate, modifiedby, modifieddate"
      )
      .eq("constant_sk", constantSk)
      .single();

    if (error || !data) {
      throw { message: "Constant record not found", statusCode: 404 };
    }

    return data;
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Insert new constant record into public.comconstant
 */
const InsertConstant = async (constantData) => {
  try {
    const validation = validateConstantInsert(constantData);
    if (!validation.isValid) {
      throw { Fieldvld: 1, message: validation.message };
    }

    const constantName = (
      constantData.Constant_Name ||
      constantData.constant_name ||
      constantData.ConstantName
    ).trim();

    const categoryName = (
      constantData.Category_Name ||
      constantData.category_name ||
      constantData.CategoryName
    ).trim();

    const rawValue =
      constantData.Constant_value !== undefined
        ? constantData.Constant_value
        : constantData.constant_value;
    const constantValue =
      rawValue !== undefined && rawValue !== null && rawValue !== ""
        ? Number(rawValue)
        : null;

    const isActive =
      constantData.IsActive !== undefined
        ? Boolean(constantData.IsActive)
        : constantData.isactive !== undefined
        ? Boolean(constantData.isactive)
        : true;

    const createdBy =
      constantData.Createdby ||
      constantData.createdby ||
      constantData.UserBy ||
      "System";

    // 1. Check for duplicate Constant_Name in the same Category_Name
    const { data: existing, error: checkError } = await supabase
      .from("comconstant")
      .select("constant_sk, constant_name, category_name")
      .ilike("category_name", categoryName)
      .ilike("constant_name", constantName)
      .limit(1);

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    if (existing && existing.length > 0) {
      throw {
        message: `Constant '${constantName}' already exists in Category '${categoryName}'.`,
        statusCode: 409,
      };
    }

    // 2. Insert into comconstant
    const payload = {
      constant_name: constantName,
      category_name: categoryName,
      constant_value: constantValue,
      isactive: isActive,
      createdby: createdBy,
      createddate: new Date().toISOString(),
    };

    const { data: inserted, error: insertError } = await supabase
      .from("comconstant")
      .insert([payload])
      .select(
        "constant_sk, constant_name, category_name, constant_value, isactive, createdby, createddate"
      )
      .single();

    if (insertError) throw insertError;

    return {
      Status: 1,
      Message: "Constant inserted successfully",
      Constant_SK: inserted.constant_sk,
      data: inserted,
    };
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Update existing constant record in public.comconstant
 */
const UpdateConstant = async (constantSk, updateData) => {
  try {
    if (!constantSk) {
      throw { Fieldvld: 1, message: "Constant_SK parameter is required" };
    }

    const validation = validateConstantUpdate(updateData);
    if (!validation.isValid) {
      throw { Fieldvld: 1, message: validation.message };
    }

    const payload = {
      modifieddate: new Date().toISOString(),
    };

    if (updateData.Constant_Name || updateData.constant_name) {
      payload.constant_name = (
        updateData.Constant_Name || updateData.constant_name
      ).trim();
    }

    if (updateData.Category_Name || updateData.category_name) {
      payload.category_name = (
        updateData.Category_Name || updateData.category_name
      ).trim();
    }

    const rawValue =
      updateData.Constant_value !== undefined
        ? updateData.Constant_value
        : updateData.constant_value;
    if (rawValue !== undefined && rawValue !== null) {
      payload.constant_value = rawValue !== "" ? Number(rawValue) : null;
    }

    if (updateData.IsActive !== undefined) {
      payload.isactive = Boolean(updateData.IsActive);
    } else if (updateData.isactive !== undefined) {
      payload.isactive = Boolean(updateData.isactive);
    }

    payload.modifiedby =
      updateData.Modifiedby ||
      updateData.modifiedby ||
      updateData.UserBy ||
      "System";

    const { data, error } = await supabase
      .from("comconstant")
      .update(payload)
      .eq("constant_sk", constantSk)
      .select(
        "constant_sk, constant_name, category_name, constant_value, isactive, modifiedby, modifieddate"
      )
      .single();

    if (error || !data) {
      throw { message: "Constant record not found for update", statusCode: 404 };
    }

    return {
      Status: 1,
      Message: "Constant updated successfully",
      data,
    };
  } catch (error) {
    throw handleResponseError(error);
  }
};

/**
 * Delete constant record (Soft-delete by default, permanent if specified)
 */
const DeleteConstant = async (constantSk, permanent = false) => {
  try {
    if (!constantSk) {
      throw { Fieldvld: 1, message: "Constant_SK parameter is required" };
    }

    if (permanent) {
      const { error } = await supabase
        .from("comconstant")
        .delete()
        .eq("constant_sk", constantSk);

      if (error) throw error;
      return { Status: 1, Message: "Constant deleted permanently" };
    } else {
      const { data, error } = await supabase
        .from("comconstant")
        .update({ isactive: false, modifieddate: new Date().toISOString() })
        .eq("constant_sk", constantSk)
        .select("constant_sk, isactive")
        .single();

      if (error || !data) {
        throw { message: "Constant not found", statusCode: 404 };
      }
      return { Status: 1, Message: "Constant deactivated successfully" };
    }
  } catch (error) {
    throw handleResponseError(error);
  }
};

module.exports = {
  GetConstantsByCategory,
  GetAllConstants,
  GetConstantById,
  InsertConstant,
  UpdateConstant,
  DeleteConstant,
};
