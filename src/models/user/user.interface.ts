import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
  avatar?: string;

  refreshToken?: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;

  // Profile fields
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
}

export interface IUserResponse {
  id: string;
  name: string;
  email: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
  avatar?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}
// If you have a separate UserDocument type, update it too

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
}

export interface IUserUpdate {
  name?: string;
  avatar?: string;
}

export type UserDocument = IUser & Document;