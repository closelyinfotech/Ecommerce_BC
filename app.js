require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const config = require("./config");
const routes = require("./PriyaEcommerce/Routes");
const jwtAuth = require("./middleware/jwtAuth");
const { testSupabaseConnection } = require("./config/supabase");

const app = express();
const port = config.port || 8025;

// Body parser configuration
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));

// Security headers
app.disable("x-powered-by");
app.use(
  helmet({
    hsts: false,
    contentSecurityPolicy: false,
    frameguard: false,
  })
);

// General API rate limiting (200 requests per 15 minutes)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: {
    code: 0,
    status: "Error",
    data: {
      error: [
        {
          errorMessage: "Too many requests from this IP. Please try again after 15 minutes.",
          status: 429,
        },
      ],
    },
  },
});
app.use("/api", generalLimiter);

// Stricter rate limiting on authentication routes (30 requests per 15 minutes)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    code: 0,
    status: "Error",
    data: {
      error: [
        {
          errorMessage: "Too many authentication attempts. Please try again after 15 minutes.",
          status: 429,
        },
      ],
    },
  },
});
app.use("/api/auth", authLimiter);

// CORS setup
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    if (
      config.allowedOrigins.indexOf(origin) !== -1 ||
      origin.includes("localhost") ||
      origin.includes("127.0.0.1")
    ) {
      return callback(null, true);
    } else {
      return callback(null, true); // Permissive in dev, can restrict in production
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
};
app.use(cors(corsOptions));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    code: 1,
    status: "Success",
    data: {
      service: "Priya Couture E-Commerce API",
      status: "Healthy",
      timestamp: new Date().toISOString(),
      supabaseConfigured: Boolean(config.supabase.url && config.supabase.anonKey),
    },
  });
});

// Mount Routes
// Public Auth Routes: /api/auth/register, /api/auth/login, /api/auth/token
app.use("/api/auth", routes.authRoutes);

// Protected User Management Routes: /api/priya/ecommerce/users/*
app.use("/api/priya/ecommerce/users", jwtAuth, routes.userRoutes);

// Common Constants Routes: /api/priya/ecommerce/constants/*
app.use("/api/priya/ecommerce/constants", routes.constantRoutes);

// 404 Error handler
app.use((req, res) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "404.html"));
  } else {
    res.status(404).json({
      code: 0,
      status: "Error",
      data: {
        error: [
          {
            errorMessage: `Endpoint '${req.originalUrl}' with method '${req.method}' not found`,
            status: 404,
          },
        ],
      },
    });
  }
});

// Global internal error handler
app.use((err, req, res, next) => {
  console.error("Unhandled Application Exception:", err);
  res.status(500).json({
    code: 0,
    status: "Error",
    data: {
      error: [
        {
          errorMessage: err.message || "Internal Server Error",
          status: 500,
        },
      ],
    },
  });
});

// Start server
app.listen(port, async () => {
  console.log(`\n======================================================`);
  console.log(`✨ Priya Couture E-Commerce Node.js Server Started ✨`);
  console.log(`🚀 Server running on: http://localhost:${port}`);
  console.log(`🛡️  JWT Authentication: Enabled`);
  console.log(`⚡ Supabase Integration: Configured`);
  console.log(`======================================================\n`);

  // Test connection to Supabase
  await testSupabaseConnection();
});

module.exports = app;
