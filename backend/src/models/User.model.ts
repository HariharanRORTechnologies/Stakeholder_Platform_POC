import { AuthProvider, MFAMethod } from '../types/auth.types';

export class User {
  id: number = 0;
  email: string = '';
  firstName: string = '';
  lastName: string = '';
  passwordHash: string = '';
  phoneNumber?: string;
  avatarUrl?: string;
  departmentId?: number;
  authProvider: AuthProvider = AuthProvider.LOCAL;
  isActive: boolean = true;
  isEmailVerified: boolean = false;
  emailVerifiedAt?: Date;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  failedLoginAttempts: number = 0;
  lockedUntil?: Date;
  mfaEnabled: boolean = false;
  mfaMethod?: MFAMethod;
  mfaSecret?: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt?: Date;

  constructor(data: Partial<User> = {}) {
    Object.assign(this, data);
  }

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  isLocked(): boolean {
    if (!this.lockedUntil) return false;
    return this.lockedUntil > new Date();
  }

  isEmailConfirmed(): boolean {
    return this.isEmailVerified && !!this.emailVerifiedAt;
  }

  canLogin(): boolean {
    return this.isActive && !this.isLocked() && this.isEmailVerified;
  }
}
