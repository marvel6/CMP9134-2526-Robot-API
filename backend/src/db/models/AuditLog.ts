import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export type ActionEnum = 'COMMAND' | 'LOGIN' | 'RESET_ROBOT';

export interface AuditLogDoc {
  action: ActionEnum;
  navigation_direction: string | null;
  user_id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

export type AuditLogHydrated = HydratedDocument<AuditLogDoc>;

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    action: { type: String, enum: ['COMMAND', 'LOGIN', 'RESET_ROBOT'], required: true, index: true },
    navigation_direction: { type: String, default: null },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    collection: 'audit_logs',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
);

auditLogSchema.virtual('id').get(function (
  this: AuditLogDoc & { _id: Types.ObjectId },
) {
  return this._id.toString();
});

// Common dashboard query is "most recent first" — keep that fast.
auditLogSchema.index({ created_at: -1 });

export const AuditLog = model<AuditLogDoc>('AuditLog', auditLogSchema);
