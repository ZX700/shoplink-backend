import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // =========================
    // CHECK HEADER EXISTS
    // =========================
    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header missing",
      });
    }

    // =========================
    // SAFE TOKEN EXTRACTION
    // =========================
    const parts = authHeader.split(" ");

    if (parts.length !== 2) {
      return res.status(401).json({
        error: "Invalid authorization format",
      });
    }

    const token = parts[1];

    if (!token) {
      return res.status(401).json({
        error: "Token missing",
      });
    }

    // =========================
    // VERIFY TOKEN
    // =========================
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    console.log("🔐 AUTH USER:", decoded.userId);

    next();
  } catch (err) {
    console.error("❌ AUTH ERROR:", err.message);

    return res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};