require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const config = require("./index");

const supabaseUrl = config.supabase.url;
// Prioritize serviceRoleKey if provided (bypasses RLS for backend), else use publishable/anon key
const supabaseKey = config.supabase.serviceRoleKey || config.supabase.key;

if (!supabaseUrl || !supabaseKey) {
  console.warn(
    "⚠️ [Supabase Warning] SUPABASE_URL or SUPABASE_KEY is missing in .env."
  );
}

const supabase = createClient(
  supabaseUrl || "https://placeholder-project.supabase.co",
  supabaseKey || "placeholder-key",
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper function to test connection to tbl_userlogindetails
const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("tbl_userlogindetails")
      .select("user_sk")
      .limit(1);

    if (error) {
      if (error.code === "42P01") {
        console.log(
          "ℹ️ [Supabase Connected] Note: Table 'tbl_userlogindetails' not yet created. Run supabase_schema.sql in Supabase SQL editor."
        );
        return true;
      }
      console.warn("⚠️ [Supabase Query Check]:", error.message);
      return false;
    }
    console.log("✅ [Supabase Connected Successfully] Table 'tbl_userlogindetails' reachable.");
    return true;
  } catch (err) {
    console.error("❌ [Supabase Connection Error]:", err.message);
    return false;
  }
};

module.exports = {
  supabase,
  testSupabaseConnection,
};
