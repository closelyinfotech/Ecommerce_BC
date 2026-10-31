require("dotenv").config();

const allowedOriginsList = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:8010",
      "http://localhost:8011",
    ];

// Normalize Supabase URL to ensure no trailing '/rest/v1/' or '/' breaks createClient
const rawSupabaseUrl = (process.env.SUPABASE_URL || "").trim();
const normalizedSupabaseUrl = rawSupabaseUrl
  .replace(/\/rest\/v1\/?$/i, "")
  .replace(/\/+$/, "");

const supabaseKey =
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  "";

module.exports = {
  port: process.env.PORT || 8025,
  env: process.env.NODE_ENV || "development",
  supabase: {
    url: normalizedSupabaseUrl,
    key: supabaseKey,
    anonKey: process.env.SUPABASE_ANON_KEY || supabaseKey,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "priya_couture_jwt_default_secret_key_2026",
    expiresIn: process.env.JWT_EXPIRES_IN || "24h",
  },
  user: {
    username: process.env.CLIENT_USERNAME || "admin@priyacouture.com",
    password: process.env.CLIENT_PASSWORD || "adminpassword",
  },
  allowedOrigins: allowedOriginsList,
};
