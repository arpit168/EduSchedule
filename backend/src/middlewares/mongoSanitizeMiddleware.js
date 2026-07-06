import mongoSanitize from 'express-mongo-sanitize';

/**
 * Express 5+ compatible wrapper for express-mongo-sanitize.
 * In Express 5, req.query is a getter-only property on IncomingMessage.
 * The default express-mongo-sanitize middleware attempts to reassign req.query = sanitized,
 * which throws a TypeError: Cannot set property query of #<IncomingMessage> which has only a getter.
 * This wrapper mutates target objects in-place and safely handles getter-only properties.
 */
const mongoSanitizeMiddleware = (options = {}) => {
  return (req, res, next) => {
    ['body', 'params', 'headers', 'query'].forEach((key) => {
      if (req[key]) {
        const sanitized = mongoSanitize.sanitize(req[key], options);
        // In Express 5+, req.query is a getter-only property.
        // Since mongoSanitize.sanitize mutates the object in-place, we only attempt re-assignment
        // for properties that are writable.
        if (key !== 'query') {
          try {
            req[key] = sanitized;
          } catch {
            // Safe fallback if any other property is or becomes read-only in future Express versions
          }
        }
      }
    });
    next();
  };
};

export default mongoSanitizeMiddleware;
