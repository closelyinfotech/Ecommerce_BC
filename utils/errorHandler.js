const handleResponseError = (error) => {
  const formatError = (errorMessage = "An error occurred", status = 500) => {
    return {
      body: {
        code: 0,
        status: "Error",
        data: {
          error: [
            {
              errorMessage:
                typeof errorMessage === "string"
                  ? errorMessage
                  : JSON.stringify(errorMessage),
              status: 0,
            },
          ],
        },
      },
      statusCode: status,
    };
  };

  try {
    // Custom field validation error
    if (error.Fieldvld === 1 || error.isValidationError) {
      return formatError(error.message || "Validation failed", 400);
    }

    // Supabase / PostgREST specific error object
    if (error.code && (typeof error.code === "string" || typeof error.code === "number")) {
      // 23505: Unique violation (e.g. duplicate email)
      if (error.code === "23505") {
        return formatError("Duplicate entry: A record with this value already exists.", 409);
      }
      // 23503: Foreign key violation
      if (error.code === "23503") {
        return formatError("Foreign key constraint violation.", 400);
      }
      // 42P01: Relation does not exist
      if (error.code === "42P01") {
        return formatError(
          "Table does not exist in Supabase database. Please run supabase_schema.sql.",
          500
        );
      }
      // PGRST116: JSON object requested, multiple (or no) rows returned
      if (error.code === "PGRST116") {
        return formatError("Requested record was not found.", 404);
      }

      const dbMessage = error.message || error.details || "Database error occurred";
      return formatError(`Supabase Error (${error.code}): ${dbMessage}`, 500);
    }

    // Axios / HTTP response errors
    if (error.response) {
      const status = error.response.status || 500;
      const data =
        error.response.data?.message ||
        error.response.data?.error ||
        error.response.data ||
        "Remote service error";
      return formatError(data, status);
    }

    // Standard JavaScript Error object
    if (error.message) {
      return formatError(error.message, error.statusCode || 500);
    }

    return formatError("Internal Server Error", 500);
  } catch (ex) {
    return formatError("Unhandled error in error handler", 500);
  }
};

module.exports = handleResponseError;
