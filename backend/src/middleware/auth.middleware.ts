import { Request, Response, NextFunction } from 'express';
import { TokenUtils } from '../utils/tokenUtils';
import { AuthenticationError, AuthorizationError } from '../errors/AppError';
import { logger } from '../utils/logger';
import { JWTPayload } from '../types/auth.types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
      token?: string;
    }
  }
}

export class AuthMiddleware {
  static verifyToken(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = this.extractToken(req);

      if (!token) {
        throw new AuthenticationError('No authentication token provided');
      }

      const payload = TokenUtils.verifyAccessToken(token);
      req.user = payload;
      req.token = token;

      next();
    } catch (error) {
      next(error);
    }
  }

  static optional(req: Request, res: Response, next: NextFunction): void {
    try {
      const token = this.extractToken(req);

      if (token) {
        try {
          const payload = TokenUtils.verifyAccessToken(token);
          req.user = payload;
          req.token = token;
        } catch (error) {
          logger.debug('Optional token verification failed', { error });
        }
      }

      next();
    } catch (error) {
      next(error);
    }
  }

  static requireRole(...roles: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
      }

      if (!roles.includes(req.user.roleName)) {
        return next(
          new AuthorizationError(
            `This action requires one of the following roles: ${roles.join(', ')}`
          )
        );
      }

      next();
    };
  }

  static requirePermission(...permissions: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
      }

      const hasPermission = permissions.some(permission =>
        req.user!.permissions.includes(permission)
      );

      if (!hasPermission) {
        return next(
          new AuthorizationError(
            `This action requires one of the following permissions: ${permissions.join(', ')}`
          )
        );
      }

      next();
    };
  }

  static requireAllPermissions(...permissions: string[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        return next(new AuthenticationError('Authentication required'));
      }

      const hasAllPermissions = permissions.every(permission =>
        req.user!.permissions.includes(permission)
      );

      if (!hasAllPermissions) {
        return next(
          new AuthorizationError(
            `This action requires all of the following permissions: ${permissions.join(', ')}`
          )
        );
      }

      next();
    };
  }

  private static extractToken(req: Request): string {
    const authHeader = req.headers.authorization;

    if (authHeader?.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    const cookies = this.parseCookies(req);
    if (cookies.accessToken) {
      return cookies.accessToken;
    }

    return '';
  }

  private static parseCookies(req: Request): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieHeader = req.headers.cookie;

    if (!cookieHeader) return cookies;

    cookieHeader.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      cookies[name] = decodeURIComponent(value);
    });

    return cookies;
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) =>
  AuthMiddleware.verifyToken(req, res, next);
