import { Request, Response, NextFunction } from 'express';
import { AuthorizationError } from '../errors/AppError';

export function permissionMiddleware(...permissions: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AuthorizationError('Authentication required'));
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
