import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { Pool } from 'mysql2/promise';
import { envConfig } from './config/env.config.js';
import { logger } from './utils/logger.js';
import { AppError } from './errors/AppError.js';
import { createAuthRoutes } from './api/v1/routes/auth.routes.js';
import { createUserRoutes } from './api/v1/routes/user.routes.js';
import { createRoleRoutes } from './api/v1/routes/role.routes.js';
import { createPermissionRoutes } from './api/v1/routes/permission.routes.js';
import { createEventRoutes } from './api/v1/routes/event.routes.js';
import { createRegistrationRoutes } from './api/v1/routes/registration.routes.js';
import { createNotificationRoutes } from './api/v1/routes/notification.routes.js';
import { createReportRoutes } from './api/v1/routes/report.routes.js';
import { createFeedbackRoutes } from './api/v1/routes/feedback.routes.js';

export function createApp(db: Pool): Express {
  const app = express();

  app.use(helmet());
  app.use(compression());

  app.use(
    cors({
      origin: envConfig.CORS_ORIGIN.split(','),
      credentials: envConfig.CORS_CREDENTIALS,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));

  const limiter = rateLimit({
    windowMs: envConfig.RATE_LIMIT_WINDOW_MS,
    max: envConfig.RATE_LIMIT_MAX_REQUESTS,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);

  app.use((req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.http(`${req.method} ${req.path} ${res.statusCode} ${duration}ms`);
    });

    next();
  });

  app.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

  const apiPrefix = `${envConfig.API_PREFIX}/${envConfig.API_VERSION}`;

  app.use(`${apiPrefix}/auth`, createAuthRoutes(db));
  app.use(`${apiPrefix}/users`, createUserRoutes(db));
  app.use(`${apiPrefix}/roles`, createRoleRoutes(db));
  app.use(`${apiPrefix}/permissions`, createPermissionRoutes(db));
  app.use(`${apiPrefix}/events`, createEventRoutes(db));
  app.use(`${apiPrefix}/registrations`, createRegistrationRoutes(db));
  app.use(`${apiPrefix}/notifications`, createNotificationRoutes(db));
  app.use(`${apiPrefix}/reports`, createReportRoutes(db));
  app.use(`${apiPrefix}/feedback`, createFeedbackRoutes(db));

  app.use((req: Request, res: Response) => {
    res.status(404).json({
      success: false,
      message: 'Route not found',
      path: req.path,
    });
  });

  app.use((err: Error | AppError, req: Request, res: Response, next: NextFunction): void => {
    if (err instanceof AppError) {
      logger.error(`AppError: ${err.message}`, {
        statusCode: err.statusCode,
        details: err.details,
      });

      res.status(err.statusCode).json({
        success: false,
        message: err.message,
        details: err.details,
      });
      return;
    }

    logger.error(`Unhandled error: ${err.message}`, { error: err });

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      ...(envConfig.NODE_ENV === 'development' && { error: err.message }),
    });
  });

  return app;
}
