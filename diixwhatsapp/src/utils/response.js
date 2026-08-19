/**
 * Response Wrapper - Padronização de respostas da API
 */
export const responseWrapper = {
  /**
   * Success response
   */
  success: (res, data, message = 'Operação realizada com sucesso', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  },

  /**
   * Error response
   */
  error: (res, message = 'Ocorreu um erro', statusCode = 500, details = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error: details
    });
  },

  /**
   * Paginated response
   */
  paginated: (res, data, pagination, message = 'Dados recuperados com sucesso') => {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination
    });
  }
};

/**
 * Sanitize user object - Remove sensitive fields
 * @param {Object} user - User object from database
 * @returns {Object} - Sanitized user object
 */
export function sanitizeUser(user) {
  if (!user) return null;

  const { passwordHash, ...sanitized } = user;
  
  return sanitized;
}

/**
 * Sanitize array of users
 * @param {Array} users - Array of user objects
 * @returns {Array} - Array of sanitized user objects
 */
export function sanitizeUsers(users) {
  if (!Array.isArray(users)) return [];
  
  return users.map(user => sanitizeUser(user));
}

export default responseWrapper;
