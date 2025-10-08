import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../shared/utils/AppError';
import { User } from '../user/user.models';
import { IAuthResponse, ILoginRequest, IRegisterRequest, ITokenPayload } from './auth.interface';

export class AuthService {
  private generateToken(payload: ITokenPayload): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT secret not configured', 500);
    }

    return jwt.sign(payload, secret, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  async register(userData: IRegisterRequest): Promise<IAuthResponse> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('User already exists with this email', 400);
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
    });

    // Generate token
    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
  }

  async login(loginData: ILoginRequest): Promise<IAuthResponse> {
    // Find user with password
    const user = await User.findOne({ email: loginData.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(loginData.password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }

    // Generate token
    const token = this.generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    };
  }
}

export const authService = new AuthService();