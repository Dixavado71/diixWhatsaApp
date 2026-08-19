/**
 * Setup global para testes
 * Carrega variáveis de ambiente ANTES de qualquer outro import
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Carrega .env.test explicitamente
const envTestPath = path.join(__dirname, '..', '.env.test');
dotenv.config({ path: envTestPath });

// Define NODE_ENV se não estiver definido
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}
