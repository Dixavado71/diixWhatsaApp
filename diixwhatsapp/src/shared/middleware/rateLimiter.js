import rateLimit from 'express-rate-limit';

/**
 * SECURITY: Centralized IP extraction utility
 * Handles IPv6 and IPv4 addresses properly, including behind reverse proxies
 * Exported for reuse across all rate limiters to avoid duplication
 */
export function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  
  const ip = req.ip || req.connection?.remoteAddress || req.socket?.remoteAddress;
  
  // Handle IPv6 loopback
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    return '127.0.0.1';
  }
  
  return ip || 'unknown';
}

/**
 * Rate limiter for login attempts
 * SECURITY: Strict limit to prevent brute force attacks
 * 3 attempts per minute per IP (reduced from 5)
 */
export const loginLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 3, // SECURITY: Only 3 login attempts per minute
  message: {
    error: 'Muitas tentativas de login. Tente novamente em 1 minuto.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getClientIp(req);
  }
});

/**
 * General API rate limiter
 * SECURITY: Reduced from 100 to 30 requests per minute
 * Prevents abuse and DoS attacks on general endpoints
 */
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // SECURITY: 30 requests per minute (was 100)
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getClientIp(req);
  }
});

/**
 * Rate limiter for sensitive operations (DELETE, password changes, etc.)
 * SECURITY: Very strict limit - 10 requests per minute
 */
export const sensitiveLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // SECURITY: Only 10 requests per minute for sensitive ops
  message: {
    error: 'Muitas requisições. Tente novamente mais tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    return getClientIp(req);
  }
});
