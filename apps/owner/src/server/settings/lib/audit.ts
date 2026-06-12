/**
 * Audit log contract.
 *
 * Types and interface only — no DB writes here.
 * Real implementation (DbAuditLogger) will be added in Sprint 2 (Booking App)
 * when the audit_logs table is created.
 *
 * All settings domain services that require audit logging accept IAuditLogger
 * as a dependency. Inject noopAuditLogger in Phase 1; swap to DbAuditLogger
 * in Sprint 2 without changing any service code.
 */

// All auditable actions across all settings domains
export type AuditAction =
  // Booking App — financial assets (QRIS)
  | 'qris_uploaded'
  | 'qris_replaced'
  | 'qris_removed'
  // Booking App — bank accounts
  | 'bank_account_added'
  | 'bank_account_edited'
  | 'bank_account_removed'
  // Booking App — configuration
  | 'payment_method_changed'
  | 'confirmation_mode_changed'
  | 'salon_policy_changed'
  // Tim — staff
  | 'staff_created'
  | 'staff_updated'
  | 'staff_deactivated'
  // Pengguna — access control
  | 'user_invited'
  | 'user_role_changed'
  | 'user_deactivated'
  | 'user_reactivated'
  | 'user_revoked'
  | 'invite_cancelled';

export interface AuditEntry {
  /** Salon being modified */
  salonId: string;
  /** User performing the action — 'system' if triggered by background process */
  actorId: string;
  /** What happened */
  action: AuditAction;
  /** Additional context — keep values as strings for easy serialisation */
  metadata?: Record<string, string>;
}

/**
 * IAuditLogger — inject this into services that require audit trails.
 * Services call logger.log() after a successful mutation.
 */
export interface IAuditLogger {
  log(entry: AuditEntry): Promise<void>;
}

/**
 * NoopAuditLogger — Phase 1 stub.
 * Writes to console only; does not touch the DB.
 * Replace with DbAuditLogger in Sprint 2.
 */
export class NoopAuditLogger implements IAuditLogger {
  async log(entry: AuditEntry): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[audit:noop]', entry.action, {
        salonId: entry.salonId,
        actor: entry.actorId,
        meta: entry.metadata,
      });
    }
  }
}

/** Singleton noop logger — use until Sprint 2 DbAuditLogger is ready. */
export const noopAuditLogger: IAuditLogger = new NoopAuditLogger();
