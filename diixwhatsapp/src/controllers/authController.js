import { authService } from '../services/authService.js';
import { loginSchema } from '../validators/authValidator.js';

/**
 * Auth Controller - Handle authentication requests
 */
export const authController = {
  /**
   * Show login page
   */
  showLogin: (req, res) => {
    if (req.session && req.session.user) {
      // Already logged in, redirect based on role
      return res.redirect(req.session.user.role === 'MASTER' ? '/admin/dashboard' : '/tenant/dashboard');
    }

    res.render('auth/login', {
      title: 'Login',
      error: null
    });
  },

  /**
   * Process login
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
        return res.render('auth/login', {
          title: 'Login',
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

      // Redirect based on role
      const returnTo = req.session.returnTo;
      delete req.session.returnTo;

      if (result.user.role === 'MASTER') {
        return res.redirect(returnTo || '/admin/dashboard');
      } else {
        return res.redirect(returnTo || '/tenant/dashboard');
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('auth/login', {
          title: 'Login',
          error: errorMessage
        });
      }

      console.error('Login error:', error);
      return res.render('auth/login', {
        title: 'Login',
        error: 'Ocorreu um erro ao fazer login. Tente novamente.'
      });
    }
  },

  /**
   * Logout
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
      res.redirect('/login');
    } catch (error) {
      console.error('Logout error:', error);
      res.redirect('/login');
    }
  },

  /**
   * Show admin login page (with different styling)
   */
  showAdminLogin: (req, res) => {
    if (req.session && req.session.user && req.session.user.role === 'MASTER') {
      return res.redirect('/admin/dashboard');
    }

    res.render('auth/admin-login', {
      title: 'Login Admin',
      error: null
    });
  },

  /**
   * Show tenant login page
   */
  showTenantLogin: (req, res) => {
    if (req.session && req.session.user && req.session.user.tenantId) {
      return res.redirect('/tenant/dashboard');
    }

    res.render('auth/tenant-login', {
      title: 'Login da Loja',
      error: null
    });
  }
};
