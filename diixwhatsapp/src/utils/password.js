import bcrypt from 'bcrypt';

const SALT_ROUNDS = 12;

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Hashed password
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a password with a hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hash to compare against
 * @returns {Promise<boolean>} True if password matches hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 6) {
    errors.push('A senha deve ter pelo menos 6 caracteres');
  }

  if (password && password.length > 100) {
    errors.push('A senha deve ter no máximo 100 caracteres');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
