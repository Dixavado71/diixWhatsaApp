/**
 * User Roles Constants
 */
export const ROLES = {
  MASTER: 'MASTER',
  TENANT_ADMIN: 'TENANT_ADMIN',
  TENANT_USER: 'TENANT_USER'
};

export const ROLE_HIERARCHY = {
  [ROLES.MASTER]: 3,
  [ROLES.TENANT_ADMIN]: 2,
  [ROLES.TENANT_USER]: 1
};

/**
 * Check if a role has sufficient permissions
 * @param {string} userRole - User's role
 * @param {string} requiredRole - Minimum required role
 * @returns {boolean}
 */
export function hasPermission(userRole, requiredRole) {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}
