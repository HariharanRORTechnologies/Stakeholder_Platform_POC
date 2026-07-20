import { logger } from './logger';

export interface AuditLogEntry {
  userId?: number;
  action: string;
  entityType?: string;
  entityId?: string | number;
  resourceType?: string;
  resourceId?: string | number;
  changes?: Record<string, any>;
  timestamp?: Date;
  ipAddress?: string;
  [key: string]: any;
}

export const auditLog = {
  async log(entry: AuditLogEntry): Promise<void> {
    logger.info('Audit log', {
      userId: entry.userId,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      changes: entry.changes,
      timestamp: entry.timestamp || new Date(),
      ipAddress: entry.ipAddress,
    });
  }
};
