import mysql from 'mysql2/promise';
import { envConfig } from '../config/env.config.js';
import { logger } from '../utils/logger.js';

let pool: mysql.Pool | null = null;

export async function initializeDatabase(): Promise<mysql.Pool> {
  if (pool) {
    return pool;
  }

  try {
    pool = mysql.createPool({
      host: envConfig.DB_HOST,
      port: envConfig.DB_PORT,
      user: envConfig.DB_USER,
      password: envConfig.DB_PASSWORD,
      database: envConfig.DB_NAME,
      waitForConnections: true,
      connectionLimit: envConfig.DB_POOL_SIZE,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      charset: 'utf8mb4',
      timezone: '+00:00',
    });

    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();

    logger.info('Database connection established successfully');
    return pool;
  } catch (error) {
    logger.error('Failed to connect to database', { error });
    throw error;
  }
}

export async function closeDatabase(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    logger.info('Database connection closed');
  }
}

export function getDatabase(): mysql.Pool {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}
