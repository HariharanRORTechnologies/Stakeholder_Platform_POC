export enum NotificationChannel {
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app',
  PUSH = 'push',
}

export enum NotificationType {
  EVENT_CREATED = 'event_created',
  EVENT_UPDATED = 'event_updated',
  REGISTRATION_CONFIRMED = 'registration_confirmed',
  EVENT_REMINDER = 'event_reminder',
  ATTENDANCE_RECORDED = 'attendance_recorded',
  CERTIFICATE_ISSUED = 'certificate_issued',
  FEEDBACK_REQUEST = 'feedback_request',
  SYSTEM = 'system',
}

export class Notification {
  id: number = 0;
  userId: number = 0;
  type: NotificationType = NotificationType.SYSTEM;
  title: string = '';
  message: string = '';
  channel: NotificationChannel = NotificationChannel.IN_APP;
  recipientAddress?: string;
  isRead: boolean = false;
  sentAt?: Date;
  readAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<Notification> = {}) {
    Object.assign(this, data);
  }

  isDelivered(): boolean {
    return this.sentAt !== undefined && this.sentAt !== null;
  }

  markAsRead(): void {
    this.isRead = true;
    this.readAt = new Date();
  }
}

export class NotificationTemplate {
  id: number = 0;
  name: string = '';
  type: NotificationType = NotificationType.SYSTEM;
  subject?: string;
  bodyTemplate: string = '';
  channels: NotificationChannel[] = [];
  isActive: boolean = true;
  createdAt: Date = new Date();
  updatedAt: Date = new Date();

  constructor(data: Partial<NotificationTemplate> = {}) {
    Object.assign(this, data);
  }
}
