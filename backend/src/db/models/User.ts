import { Schema, model, type HydratedDocument, type Model, type Types } from 'mongoose';

export type RoleEnum = 'VIEWER' | 'COMMANDER';

export interface UserDoc {
  email: string;
  full_name: string | null;
  password: string;
  is_super_admin: boolean;
  is_active: boolean;
  last_login: Date | null;
  role: RoleEnum;
  created_at: Date;
  updated_at: Date;
}

export type UserHydrated = HydratedDocument<UserDoc> & { _id: Types.ObjectId };

const userSchema = new Schema<UserDoc, Model<UserDoc>>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    full_name: { type: String, default: null },
    password: { type: String, required: true },
    is_super_admin: { type: Boolean, required: true, default: false },
    is_active: { type: Boolean, required: true, default: true },
    last_login: { type: Date, default: null },
    role: { type: String, enum: ['VIEWER', 'COMMANDER'], required: true, default: 'VIEWER' },
  },
  {
    collection: 'users',
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform(_doc, ret) {
        // Strip the password hash from any JSON serialisation.
        (ret as Record<string, unknown>).password = undefined;
        delete (ret as Record<string, unknown>).password;
      },
    },
    toObject: { virtuals: true, versionKey: false },
  },
);

userSchema.virtual('id').get(function (this: UserDoc & { _id: Types.ObjectId }) {
  return this._id.toString();
});

export const User = model<UserDoc>('User', userSchema);
