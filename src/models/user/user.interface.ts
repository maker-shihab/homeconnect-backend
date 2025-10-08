import { Document } from 'mongoose';

export interface IUser extends Document {
  _id: string;
  name: string;
  email: string;
  password: string;
  role: 'student' | 'landlord' | 'admin';
  phone?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCreate {
  name: string;
  email: string;
  password: string;
  role?: 'student' | 'landlord' | 'admin';
  phone?: string;
}

export interface IUserUpdate {
  name?: string;
  phone?: string;
  avatar?: string;
}