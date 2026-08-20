import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';
import { logger } from '../../infrastructure/database/prismaClient.js';
import { config } from '../../config/env.js';

/**
 * Async Handler Wrapper - Wraps async controller functions to catch errors
 * and forward them to Express error handling middleware
 * @param {Function} fn - Async controller function
 * @returns {Function} Express middleware function
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Global Error Handler Middleware (API ONLY)
 */
export function errorHandler(err, req, res, next) {
  // Log do erro para monitoramento (stack trace apenas em desenvolvimento)
  logger.error('Error occurred', {
    message: err.message,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
    url: req.url,
    method: req.method
  });

  const isDev = config.nodeEnv === 'development';

  // 1. Tratamento de Erros de Validação (Zod)
  if (err instanceof ZodError) {
    const errorMessage = err.errors.map(e => e.message).join(', ') || 'Dados inválidos';
    return res.status(400).json({
      success: false,
      error: 'Erro de Validação',
      details: errorMessage
    });
  }

  // 2. Tratamento de Erros do Prisma
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Violação de unicidade
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          details: 'Já existe um registro com estes dados.'
        });
      case 'P2003': // Violação de chave estrangeira
        return res.status(400).json({
          success: false,
          error: 'Erro de Referência',
          details: 'Este registro está sendo utilizado em outro lugar.'
        });
      case 'P2025': // Registro não encontrado
        return res.status(404).json({
          success: false,
          error: 'Não Encontrado',
          details: 'O registro solicitado não existe.'
        });
      default:
        logger.error('Prisma error', { code: err.code, message: err.message });
        break;
    }
  }

  // 3. Tratamento de Erros de Parse de JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: 'Requisição Inválida',
      details: 'Dados enviados em formato JSON inválido.'
    });
  }

  // 4. Erro Padrão (Fallback para 500)
  res.status(err.status || 500).json({
    success: false,
    error: 'Erro Interno',
    details: isDev ? err.message : 'Ocorreu um erro interno. Por favor, tente novamente.'
  });
}

/**
 * 404 Not Found Handler
 */
export function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    error: 'Página Não Encontrada',
    details: 'A rota que você está procurando não foi encontrada.'
  });
}