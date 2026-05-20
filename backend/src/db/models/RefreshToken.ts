import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface RefreshTokenDoc {
  token: string;
  expires_at: Date;
  is_blacklisted: boolean;
  user_id: Types.ObjectId;
  created_at: Date;
  updated_at: Date;
}

export type RefreshTokenHydrated = HydratedDocument<RefreshTokenDoc>;

const refreshTokenSchema = new Schema<RefreshTokenDoc>(
  {
    token: { type: String, required: true, unique: true },
    expires_at: { type: Date, required: true, index: true },
    is_blacklisted: { type: Boolean, required: true, default: false },
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  },
  {
    collection: 'refresh_tokens',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: { virtuals: true, versionKey: false },
    toObject: { virtuals: true, versionKey: false },
  },
);

refreshTokenSchema.virtual('id').get(function (
  this: RefreshTokenDoc & { _id: Types.ObjectId },
) {
  return this._id.toString();
});

export const RefreshToken = model<RefreshTokenDoc>('RefreshToken', refreshTokenSchema);
