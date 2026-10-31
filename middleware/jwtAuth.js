const jwt = require("jsonwebtoken");
const config = require("../config");

const jwtAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      code: 0,
      status: "Error",
      data: {
        error: [
          {
            errorMessage: "Access Denied: Authorization token missing in Bearer header",
            status: 401,
          },
        ],
      },
    });
  }

  jwt.verify(token, config.jwt.secret, (err, decodedUser) => {
    if (err) {
      const message =
        err.name === "TokenExpiredError"
          ? "Session expired: JWT token has expired. Please log in again."
          : "Invalid token: Token verification failed";

      return res.status(403).json({
        code: 0,
        status: "Error",
        data: {
          error: [
            {
              errorMessage: message,
              status: 403,
            },
          ],
        },
      });
    }

    req.user = decodedUser;
    next();
  });
};

module.exports = jwtAuth;
