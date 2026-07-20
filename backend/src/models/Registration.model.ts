export enum RegistrationStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CHECKED_IN = 'checked_in',
  ATTENDED = 'attended',
  NO_SHOW = 'no_show',
  CANCELLED = 'cancelled',
  WAITLISTED = 'waitlisted',
}

export class Registration {
  id: number = 0;
  eventId: number = 0;
  userId: number = 0;
  status: RegistrationStatus = RegistrationStatus.PENDING;
  registrationDate: Date = new Date();
  approvedBy?: number;
  checkedInAt?: Date;
  attendedAt?: Date;
  notes?: string;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();
  deletedAt?: Date;

  constructor(data: Partial<Registration> = {}) {
    Object.assign(this, data);
  }

  isConfirmed(): boolean {
    return this.status === RegistrationStatus.CONFIRMED;
  }

  isAttended(): boolean {
    return this.status === RegistrationStatus.ATTENDED || this.status === RegistrationStatus.CHECKED_IN;
  }

  canBeCancelled(): boolean {
    return (
      this.status !== RegistrationStatus.CANCELLED &&
      this.status !== RegistrationStatus.ATTENDED
    );
  }
}

export class Attendance {
  id: number = 0;
  registrationId: number = 0;
  eventId: number = 0;
  userId: number = 0;
  checkedInAt: Date = new Date();
  checkedOutAt?: Date;
  duration?: number;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Attendance> = {}) {
    Object.assign(this, data);
  }

  getDuration(): number {
    if (!this.checkedOutAt) return 0;
    return Math.round((this.checkedOutAt.getTime() - this.checkedInAt.getTime()) / 1000 / 60);
  }
}
