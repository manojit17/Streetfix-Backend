// ─────────────────────────────────────────────────────────────
//  middleware/error.js
//  PURPOSE : Catch ALL errors thrown anywhere in the app
//            and send a clean JSON response instead of crashing
//  HOW     : Express treats any middleware with 4 params
//            (err, req, res, next) as an error handler
// ─────────────────────────────────────────────────────────────

const errorHandler = (err, req, res, next) => {
  // Log the error to the terminal so developers can debug
  console.error('❌ Error:', err.message);

  // Default to 500 (Internal Server Error) unless already set
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message    = err.message || 'Server Error';

  // ── Mongoose: Bad ObjectId (e.g. /api/reports/not-a-valid-id) ──
  if (err.name === 'CastError') {
    statusCode = 404;
    message    = 'Resource not found — invalid ID format';
  }

  // ── Mongoose: Duplicate key (e.g. registering same email twice) ──
  if (err.code === 11000) {
    statusCode = 400;
    // Extract the field name from the error (e.g. "email")
    const field = Object.keys(err.keyValue)[0];
    message     = `${field} already exists — please use a different one`;
  }

  // ── Mongoose: Validation error (e.g. required field missing) ──
  if (err.name === 'ValidationError') {
    statusCode = 400;
    // Collect all validation error messages into one string
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
  }

  // ── JWT: Token is invalid or expired ──
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message    = 'Invalid token — please login again';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message    = 'Token expired — please login again';
  }

  // Send the final error response
  res.status(statusCode).json({
    success: false,
    message,
    // Only show the full stack trace in development mode
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorHandler };
