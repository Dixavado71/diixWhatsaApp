import { authService } from '../services/authService.js';
import { loginSchema } from '../validators/authValidator.js';

/**
 * Auth Controller - Handle authentication requests (API mode)
 */
export const authController = {
  /**
   * Show login page - Returns JSON for API clients
   */
  showLogin: (req, res) => {
    if (req.session && req.session.user) {
      // Already logged in, return user info
      return res.json({
        authenticated: true,
        user: {
          id: req.session.user.id,
          username: req.session.user.username,
          role: req.session.user.role,
          tenantId: req.session.user.tenantId
        },
        redirect: req.session.user.role === 'MASTER' ? '/admin/dashboard' : '/tenant/dashboard'
      });
    }

    res.json({
      authenticated: false,
      message: 'Please provide credentials to login',
      endpoint: 'POST /login',
      requiredFields: ['username', 'password']
    });
  },

  /**
   * Process login - Returns JSON response
   */
  login: async (req, res) => {
    try {
      // Validate input
      const validatedData = loginSchema.parse(req.body);

      // Get IP and user agent for logging
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      // Authenticate
      const result = await authService.authenticate(
        validatedData.username,
        validatedData.password,
        ip,
        userAgent
      );

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: result.error
        });
      }

      // Regenerate session to prevent session fixation
      await new Promise((resolve, reject) => {
        req.session.regenerate((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      // Store user in session (without sensitive data)
      req.session.user = result.user;

      // Return success response with user info
      const response = {
        success: true,
        message: 'Login successful',
        user: {
          id: result.user.id,
          username: result.user.username,
          role: result.user.role,
          tenantId: result.user.tenantId
        },
        redirect: result.user.role === 'MASTER' ? '/admin/dashboard' : '/tenant/dashboard'
      };

      res.json(response);
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Login error:', error);
      return res.status(500).json({
        success: false,
        error: 'Ocorreu um erro ao fazer login. Tente novamente.'
      });
    }
  },

  /**
   * Logout - Returns JSON response
   */
  logout: async (req, res) => {
    try {
      const userId = req.session.user?.id;
      const ip = req.ip || req.connection.remoteAddress;
      const userAgent = req.get('user-agent') || '';

      if (userId) {
        await authService.logout(userId, ip, userAgent);
      }

      // Destroy session
      await new Promise((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      res.clearCookie('diixwhatsapp.sid');
      res.json({
        success: true,
        message: 'Logout successful',
        redirect: '/login'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao fazer logout'
      });
    }
  },

  /**
   * Show admin login page - Returns JSON for API clients
   */
  showAdminLogin: (req, res) => {
    if (req.session && req.session.user && req.session.user.role === 'MASTER') {
      return res.json({
        authenticated: true,
        user: req.session.user,
        redirect: '/admin/dashboard'
      });
    }

    res.json({
      authenticated: false,
      message: 'Admin login required',
      endpoint: 'POST /login',
      requiredRole: 'MASTER'
    });
  },

  /**
   * Show tenant login page - Returns JSON for API clients
   */
  showTenantLogin: (req, res) => {
    if (req.session && req.session.user && req.session.user.tenantId) {
      return res.json({
        authenticated: true,
        user: req.session.user,
        redirect: '/tenant/dashboard'
      });
    }

    res.json({
      authenticated: false,
      message: 'Tenant login required',
      endpoint: 'POST /login',
      requiredRole: 'TENANT'
    });
  }
};
