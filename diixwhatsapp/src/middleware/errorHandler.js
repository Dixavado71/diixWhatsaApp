import { appLogger } from '../utils/logger.js';

/**
 * Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  appLogger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Don't expose internal errors in production
  const isDev = process.env.NODE_ENV === 'development';

  // Handle Prisma errors
  if (err.code) {
    if (err.code === 'P2002') {
      return res.status(409).render('errors/500', {
        title: 'Conflito',
        message: 'Já existe um registro com estes dados.',
        error: isDev ? err.message : undefined
      });
    }
  }

  // Default to 500
  res.status(err.status || 500);
  res.render('errors/500', {
    title: 'Erro Interno',
    message: isDev ? err.message : 'Ocorreu um erro interno. Por favor, tente novamente.',
    error: isDev ? err.stack : undefined
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).render('errors/404', {
    title: 'Página Não Encontrada',
    message: 'A página que você está procurando não foi encontrada.'
  });
}
