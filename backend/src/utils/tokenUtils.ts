import jwt from 'jsonwebtoken';
import { envConfig } from '../config/env.config';
import { JWTPayload, TokenPair } from '../types/auth.types';
import { AppError } from '../errors/AppError';
import { logger } from './logger';

export class TokenUtils {
  static generateTokenPair(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload.userId);

    const decoded = jwt.decode(accessToken) as JWTPayload;
    const expiresIn = decoded.exp * 1000 - Date.now();

    return {
      accessToken,
      refreshToken,
      expiresIn: Math.floor(expiresIn / 1000),
    };
  }

  static generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    try {
      return jwt.sign(payload, envConfig.JWT_SECRET as string, {
        expiresIn: envConfig.JWT_EXPIRY as string,
        algorithm: 'HS256',
      } as jwt.SignOptions);
    } catch (error) {
      logger.error('Failed to generate access token', { error });
      throw new AppError('Failed to generate access token', 500);
    }
  }

  static generateRefreshToken(userId: number): string {
    try {
      return jwt.sign({ userId }, envConfig.JWT_REFRESH_SECRET as string, {
        expiresIn: envConfig.JWT_REFRESH_EXPIRY as string,
        algorithm: 'HS256',
      } as jwt.SignOptions);
    } catch (error) {
      logger.error('Failed to generate refresh token', { error });
      throw new AppError('Failed to generate refresh token', 500);
    }
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, envConfig.JWT_SECRET, {
        algorithms: ['HS256'],
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Access token has expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid access token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  static verifyRefreshToken(token: string): { userId: number } {
    try {
      return jwt.verify(token, envConfig.JWT_REFRESH_SECRET, {
        algorithms: ['HS256'],
      }) as { userId: number };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token has expired', 401);
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401);
      }
      throw new AppError('Token verification failed', 401);
    }
  }

  static decodeToken<T = any>(token: string): T | null {
    try {
      return jwt.decode(token) as T;
    } catch (error) {
      return null;
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded?.exp) return true;
      return decoded.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }

  static getTokenExpiryTime(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as JWTPayload;
      if (!decoded?.exp) return null;
      return new Date(decoded.exp * 1000);
    } catch {
      return null;
    }
  }
}
