import { db } from '../config/firebase.js';
import { AuditLog, UserProfile } from '@projuktix/types';

export class AuditService {
  static async log(
    user: UserProfile,
    action: string,
    resourceType: string,
    resourceId: string,
    changes?: { before?: Record<string, unknown> | null; after?: Record<string, unknown> | null },
    ipAddress?: string
  ): Promise<void> {
    try {
      const logRef = db.collection('auditLogs').doc();
      const entry: AuditLog = {
        id: logRef.id,
        actorId: user.uid,
        actorEmail: user.email,
        actorRole: user.role,
        action,
        resourceType,
        resourceId,
        timestamp: new Date().toISOString(),
        changes,
        ipAddress,
      };
      await logRef.set(entry);
    } catch (err) {
      console.error('[AuditService Error]:', err);
    }
  }
}
