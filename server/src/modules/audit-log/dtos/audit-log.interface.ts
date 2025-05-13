export type AuditLogAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'READ'
  | 'LOGIN'
  | 'LOGOUT'
  | 'OTHER';

export type AuditLogEntityType =
  | 'USER'
  | 'EVENT'
  | 'BOOKING'
  | 'CATEGORY'
  | 'VENUE'
  | 'TAG'
  | 'SETTING'
  | 'OTHER';

export interface IAuditLog {
  id: string;
  action: AuditLogAction;
  entityType: AuditLogEntityType;
  entityId: string;
  userId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}
