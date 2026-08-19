import { Prisma } from '@prisma/client';
import { logger } from '../../infrastructure/database/prismaClient.js';
import { config } from '../../config/env.js';

/**
 * Error Handler Middleware
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method
  });

  // Don't expose internal errors in production
  const isDev = config.nodeEnv === 'development';

  // Handle Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        return res.status(409).json({
          error: 'Conflito',
          message: 'Já existe um registro com estes dados.',
          details: isDev ? err.message : undefined
        });
      case 'P2003': // Foreign key constraint violation
        return res.status(400).json({
          error: 'Erro de Referência',
          message: 'Este registro está sendo utilizado em outro lugar.',
          details: isDev ? err.message : undefined
        });
      case 'P2025': // Record not found
        return res.status(404).json({
          error: 'Não Encontrado',
          message: 'Registro não encontrado.',
          details: isDev ? err.message : undefined
        });
      default:
        logger.db.error('Prisma error', err.code, err);
        break;
    }
  }

  // Handle JSON parse errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: 'Requisição Inválida',
      message: 'Dados enviados em formato inválido.',
      details: isDev ? err.message : undefined
    });
  }

  // Default to 500
  res.status(err.status || 500).json({
    error: 'Erro Interno',
    message: isDev ? err.message : 'Ocorreu um erro interno. Por favor, tente novamente.',
    details: isDev ? err.stack : undefined
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'Página Não Encontrada',
    message: 'A página que você está procurando não foi encontrada.'
  });
}
