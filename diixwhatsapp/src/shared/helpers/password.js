import bcrypt from 'bcrypt';
import { z } from 'zod';

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
 * Zod schema for password validation
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter pelo menos 8 caracteres')
  .max(100, 'Senha muito longa')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos 1 letra maiúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos 1 número')
  .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos 1 caractere especial');

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {{valid: boolean, errors: string[]}} Validation result
 */
export function validatePasswordStrength(password) {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('A senha deve ter pelo menos 8 caracteres');
  }

  if (password && password.length > 100) {
    errors.push('A senha deve ter no máximo 100 caracteres');
  }

  if (password && !/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 letra maiúscula');
  }

  if (password && !/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 número');
  }

  if (password && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos 1 caractere especial');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
