import { Pool } from 'mysql2/promise';
import { UserRepository } from '../repositories/userRepository';
import { User } from '../models/User.model';
import { AuthValidator } from '../validators/auth.validator';
import { CryptoUtils } from '../utils/cryptoUtils';
import { TokenUtils } from '../utils/tokenUtils';
import { logger } from '../utils/logger';
import {
  LoginCredentials,
  UserRegistration,
  TokenPair,
  MFASetupResponse,
  PasswordReset,
  JWTPayload,
  MFAMethod,
} from '../types/auth.types';
import {
  AuthenticationError,
  NotFoundError,
  ConflictError,
  ValidationError,
  AppError,
} from '../errors/AppError';

export class AuthService {
  private userRepository: UserRepository;

  constructor(private db: Pool) {
    this.userRepository = new UserRepository(db);
  }

  async login(credentials: LoginCredentials, ipAddress?: string): Promise<TokenPair> {
    AuthValidator.validateLoginCredentials(credentials);

    const user = await this.userRepository.findByEmail(credentials.email);
    if (!user) {
      throw new AuthenticationError('Invalid email or password');
    }

    if (!user.canLogin()) {
      throw new AuthenticationError('Account is inactive or locked. Please contact support');
    }

    const passwordValid = await CryptoUtils.comparePassword(credentials.password, user.passwordHash);
    if (!passwordValid) {
      await this.userRepository.recordLoginAttempt(user.id, false, ipAddress);
      throw new AuthenticationError('Invalid email or password');
    }

    await this.userRepository.recordLoginAttempt(user.id, true, ipAddress);

    if (user.mfaEnabled) {
      return this.generateMFAPendingResponse();
    }

    const permissions = await this.getUserPermissions(user.id);
    const roles = await this.getUserRoles(user.id);
    const role = roles[0];

    const tokenPair = TokenUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      roleId: role.id,
      roleName: role.name,
      permissions,
    });

    logger.info(`User ${user.email} logged in`, { userId: user.id, ipAddress });
    return tokenPair;
  }

  async register(registrationData: UserRegistration): Promise<{ user: User; tokenPair: TokenPair }> {
    AuthValidator.validateRegistration(registrationData);

    const existingUser = await this.userRepository.findByEmail(registrationData.email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const passwordHash = await CryptoUtils.hashPassword(registrationData.password);

    const newUser = new User({
      email: registrationData.email,
      firstName: registrationData.firstName,
      lastName: registrationData.lastName,
      passwordHash,
      phoneNumber: registrationData.phoneNumber,
      departmentId: registrationData.departmentId,
      isActive: true,
      isEmailVerified: false,
    });

    const userId = await this.userRepository.create(newUser);
    newUser.id = userId;

    await this.assignDefaultRole(userId);

    const permissions = await this.getUserPermissions(userId);
    const roles = await this.getUserRoles(userId);
    const role = roles[0];

    const tokenPair = TokenUtils.generateTokenPair({
      userId: newUser.id,
      email: newUser.email,
      roleId: role.id,
      roleName: role.name,
      permissions,
    });

    logger.info(`New user registered: ${newUser.email}`, { userId });
    return { user: newUser, tokenPair };
  }

  async verifyToken(token: string): Promise<JWTPayload> {
    return TokenUtils.verifyAccessToken(token);
  }

  async refreshToken(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = TokenUtils.verifyRefreshToken(refreshToken);
      const user = await this.userRepository.findById(decoded.userId);

      if (!user || !user.canLogin()) {
        throw new AuthenticationError('User not found or inactive');
      }

      const permissions = await this.getUserPermissions(user.id);
      const roles = await this.getUserRoles(user.id);
      const role = roles[0];

      return TokenUtils.generateTokenPair({
        userId: user.id,
        email: user.email,
        roleId: role.id,
        roleName: role.name,
        permissions,
      });
    } catch (error) {
      if (error instanceof AuthenticationError) throw error;
      throw new AuthenticationError('Invalid refresh token');
    }
  }

  async setupMFA(userId: number): Promise<MFASetupResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const { secret, qrCode } = CryptoUtils.generateMFASecret(user.email);
    const qrCodeImage = await CryptoUtils.generateMFAQRCode(secret, user.email);
    const backupCodes = CryptoUtils.generateBackupCodes();

    return {
      qrCode: qrCodeImage,
      secret,
      backupCodes,
    };
  }

  async confirmMFA(userId: number, secret: string, token: string): Promise<{ backupCodes: string[] }> {
    AuthValidator.validateMFAToken(token);

    const isValid = CryptoUtils.verifyMFAToken(secret, token);
    if (!isValid) {
      throw new ValidationError('Invalid MFA token');
    }

    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const backupCodes = CryptoUtils.generateBackupCodes();
    const backupCodeHashes = await Promise.all(
      backupCodes.map(code => CryptoUtils.hashBackupCode(code))
    );

    await this.userRepository.update(userId, {
      mfaEnabled: true,
      mfaSecret: secret,
      mfaMethod: MFAMethod.TOTP,
    });

    await this.storeBackupCodes(userId, backupCodeHashes);

    logger.info(`MFA enabled for user ${user.email}`, { userId });
    return { backupCodes };
  }

  async disableMFA(userId: number): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    await this.userRepository.update(userId, {
      mfaEnabled: false,
      mfaSecret: undefined,
      mfaMethod: undefined,
    });

    await this.deleteBackupCodes(userId);
    logger.info(`MFA disabled for user ${user.email}`, { userId });
  }

  async verifyMFA(userId: number, token: string): Promise<TokenPair> {
    AuthValidator.validateMFAToken(token);

    const user = await this.userRepository.findById(userId);
    if (!user || !user.mfaSecret) {
      throw new AuthenticationError('MFA not enabled for this user');
    }

    const isValid = CryptoUtils.verifyMFAToken(user.mfaSecret, token);
    if (!isValid) {
      throw new AuthenticationError('Invalid MFA token');
    }

    const permissions = await this.getUserPermissions(user.id);
    const roles = await this.getUserRoles(user.id);
    const role = roles[0];

    return TokenUtils.generateTokenPair({
      userId: user.id,
      email: user.email,
      roleId: role.id,
      roleName: role.name,
      permissions,
    });
  }

  async requestPasswordReset(email: string): Promise<string> {
    AuthValidator.validateEmail(email);

    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return 'If this email exists, a reset link will be sent';
    }

    const resetToken = CryptoUtils.generatePasswordResetToken();
    const resetTokenHash = CryptoUtils.hashToken(resetToken);

    await this.storePasswordResetToken(user.id, resetTokenHash);
    await this.sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Password reset requested for ${user.email}`, { userId: user.id });
    return 'Password reset email sent';
  }

  async resetPassword(data: PasswordReset): Promise<void> {
    AuthValidator.validatePasswordReset(data);

    const resetTokenHash = CryptoUtils.hashToken(data.token);
    const userId = await this.verifyPasswordResetToken(resetTokenHash);

    if (!userId) {
      throw new ValidationError('Invalid or expired reset token');
    }

    const passwordHash = await CryptoUtils.hashPassword(data.newPassword);
    await this.userRepository.updatePassword(userId, passwordHash);
    await this.invalidatePasswordResetToken(resetTokenHash);

    logger.info(`Password reset for user ${userId}`, { userId });
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordValid = await CryptoUtils.comparePassword(currentPassword, user.passwordHash);
    if (!passwordValid) {
      throw new AuthenticationError('Current password is incorrect');
    }

    AuthValidator.validatePassword(newPassword);

    const passwordHash = await CryptoUtils.hashPassword(newPassword);
    await this.userRepository.updatePassword(userId, passwordHash);

    logger.info(`Password changed for user ${user.email}`, { userId });
  }

  async logout(userId: number, accessToken: string): Promise<void> {
    await this.revokeToken(accessToken);
    logger.info(`User ${userId} logged out`);
  }

  private async getUserRoles(
    userId: number
  ): Promise<Array<{ id: number; name: string }>> {
    const sql = `
      SELECT r.id, r.name FROM roles r
      JOIN user_roles ur ON r.id = ur.role_id
      WHERE ur.user_id = ? AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `;
    return this.userRepository['query'](sql, [userId]);
  }

  private async getUserPermissions(userId: number): Promise<string[]> {
    const sql = `
      SELECT DISTINCT p.name FROM permissions p
      JOIN role_permissions rp ON p.id = rp.permission_id
      JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = ? AND ur.is_active = TRUE
      AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    `;
    const results = await this.userRepository['query'](sql, [userId]);
    return results.map((r: any) => r.name);
  }

  private async assignDefaultRole(userId: number): Promise<void> {
    const sql = `
      INSERT INTO user_roles (user_id, role_id, is_active)
      SELECT ?, id, TRUE FROM roles WHERE name = 'Employee' LIMIT 1
    `;
    await this.userRepository['execute'](sql, [userId]);
  }

  private async storeBackupCodes(userId: number, codes: string[]): Promise<void> {
    const sql = 'INSERT INTO mfa_backup_codes (user_id, code_hash) VALUES (?, ?)';
    for (const code of codes) {
      await this.userRepository['execute'](sql, [userId, code]);
    }
  }

  private async deleteBackupCodes(userId: number): Promise<void> {
    const sql = 'DELETE FROM mfa_backup_codes WHERE user_id = ?';
    await this.userRepository['execute'](sql, [userId]);
  }

  private async storePasswordResetToken(userId: number, tokenHash: string): Promise<void> {
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    const sql = `
      INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
      VALUES (?, ?, ?)
    `;
    await this.userRepository['execute'](sql, [userId, tokenHash, expiresAt]);
  }

  private async verifyPasswordResetToken(tokenHash: string): Promise<number | null> {
    const sql = `
      SELECT user_id FROM password_reset_tokens
      WHERE token_hash = ? AND expires_at > NOW() AND used_at IS NULL
    `;
    const result = await this.userRepository['queryOne'](sql, [tokenHash]);
    return result?.user_id || null;
  }

  private async invalidatePasswordResetToken(tokenHash: string): Promise<void> {
    const sql = 'UPDATE password_reset_tokens SET used_at = NOW() WHERE token_hash = ?';
    await this.userRepository['execute'](sql, [tokenHash]);
  }

  private async revokeToken(token: string): Promise<void> {
    const tokenHash = CryptoUtils.hashToken(token);
    const sql = 'UPDATE session_tokens SET revoked_at = NOW() WHERE access_token_hash = ?';
    await this.userRepository['execute'](sql, [tokenHash]);
  }

  private async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${resetToken}`;
    logger.info(`Password reset email would be sent to ${email}`, { resetLink });
  }

  private generateMFAPendingResponse(): TokenPair {
    return {
      accessToken: 'mfa_pending',
      refreshToken: '',
      expiresIn: 300,
    };
  }
}
