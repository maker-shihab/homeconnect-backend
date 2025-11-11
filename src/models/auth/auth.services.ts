import bcryptjs from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import JWT_CONFIG from '../../shared/config/jwt.config';
import { AppError } from '../../shared/utils/AppError';
import { emailService } from '../../shared/utils/email';
import { User } from '../user/user.models';
import {
  IAuthResponse,
  IChangePasswordRequest,
  IForgotPasswordRequest,
  ILoginRequest,
  IRegisterRequest,
  IResetPasswordRequest,
  ITokenPayload,
  IUpdateProfileRequest,
  IVerifyEmailRequest
} from './auth.interface';
import {
  authResponseSchema,
  messageResponseSchema
} from './auth.validation';

export class AuthService {
  // Generate JWT Token
  private generateToken(payload: ITokenPayload): { token: string; expiresIn: string } {
    const token = jwt.sign(payload, JWT_CONFIG.access.secret, {
      expiresIn: JWT_CONFIG.access.expiresIn
    } as jwt.SignOptions);
    return {
      token, expiresIn: JWT_CONFIG.access.expiresIn
    };
  }

  // Generate Refresh Token
  private generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, JWT_CONFIG.refresh.secret, {
      expiresIn: JWT_CONFIG.refresh.expiresIn
    } as jwt.SignOptions);
  }

  // Register User
  async register(userData: IRegisterRequest): Promise<IAuthResponse> {
    try {
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new AppError('User already exists with this email', 409);
      }

      if (userData.phone) {
        const phoneRegex = /^\+?[1-9]\d{1,14}$/;
        if (!phoneRegex.test(userData.phone)) {
          throw new AppError('Invalid phone number format', 400);
        }
      }

      const refreshToken = this.generateRefreshToken({ userId: '', email: userData.email, role: userData.role });
      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      const user = await User.create({
        ...userData,
        refreshToken,
        emailVerificationToken,
        emailVerificationExpires,
        isEmailVerified: false,
        isActive: true,
      });

      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const { token, expiresIn } = this.generateToken(tokenPayload);

      try {
        await emailService.sendVerificationEmail(user.email, emailVerificationToken);
      } catch (emailError) {
        console.warn('Failed to send verification email:', emailError);
      }

      const authResponse: IAuthResponse = {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
        },
        token,
        expiresIn,
        refreshToken,
      };

      return authResponseSchema.parse(authResponse);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Registration failed', 500);
    }
  }
  // Login User
  async login(loginData: ILoginRequest): Promise<IAuthResponse> {
    try {
      // Find user with password
      const user = await User.findOne({ email: loginData.email })
        .select('+password +isActive +refreshToken');

      if (!user) {
        throw new AppError('Invalid email or password', 401);
      }

      // Check if user is active
      if (!user.isActive) {
        throw new AppError('Account has been deactivated', 403);
      }
      const isPasswordValid = await user.comparePassword(loginData.password);

      if (!isPasswordValid) {
        throw new AppError('Invalid email or password', 401);
      }

      // Generate tokens
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const { token } = this.generateToken(tokenPayload);
      const refreshToken = this.generateRefreshToken(tokenPayload);

      user.refreshToken = refreshToken;
      user.lastLogin = new Date();
      await user.save();

      const authResponse: IAuthResponse = {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
        },
        token,
        expiresIn: JWT_CONFIG.access.expiresIn,
        refreshToken,
      };

      return authResponseSchema.parse(authResponse);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Login failed', 500);
    }
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<IAuthResponse> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, JWT_CONFIG.refresh.secret) as ITokenPayload;

      // Find user with refresh token
      const user = await User.findOne({
        _id: decoded.userId,
        refreshToken
      });

      if (!user) {
        throw new AppError('Invalid refresh token', 401);
      }

      // Generate new tokens
      const tokenPayload = {
        userId: user._id.toString(),
        email: user.email,
        role: user.role,
      };

      const { token, expiresIn } = this.generateToken(tokenPayload);
      const newRefreshToken = this.generateRefreshToken(tokenPayload);

      // Update refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      const authResponse: IAuthResponse = {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          phone: user.phone,
        },
        token, // Use the destructured token here
        expiresIn: JWT_CONFIG.access.expiresIn,
        refreshToken: newRefreshToken,
      };

      return authResponseSchema.parse(authResponse);

    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  // Forgot Password
  async forgotPassword(emailData: IForgotPasswordRequest): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email: emailData.email });
      if (!user) {
        // Don't reveal if email exists or not
        return { message: 'If the email exists, a reset link has been sent' };
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000);

      user.passwordResetToken = resetToken;
      user.passwordResetExpires = resetTokenExpires;
      await user.save();

      try {
        await emailService.sendPasswordResetEmail(user.email, resetToken);
      } catch (emailError) {
        console.warn('Failed to send password reset email:', emailError);
      }

      return messageResponseSchema.parse({
        message: 'If the email exists, a reset link has been sent'
      });

    } catch (error) {
      throw new AppError('Failed to process forgot password request', 500);
    }
  }

  // Reset Password
  async resetPassword(resetData: IResetPasswordRequest): Promise<{ message: string }> {
    try {
      // Find user by reset token
      const user = await User.findOne({
        passwordResetToken: resetData.token,
        passwordResetExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError('Invalid or expired reset token', 400);
      }

      // Hash new password
      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(resetData.password, salt);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();

      return messageResponseSchema.parse({
        message: 'Password reset successfully'
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to reset password', 500);
    }
  }

  // Change Password
  async changePassword(userId: string, passwordData: IChangePasswordRequest): Promise<{ message: string }> {
    try {
      const user = await User.findById(userId).select('+password');
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Verify current password
      const isCurrentPasswordValid = await bcryptjs.compare(
        passwordData.currentPassword,
        user.password
      );

      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400);
      }

      // Hash new password
      const salt = await bcryptjs.genSalt(12);
      const hashedPassword = await bcryptjs.hash(passwordData.newPassword, salt);

      // Update password
      user.password = hashedPassword;
      await user.save();

      return messageResponseSchema.parse({
        message: 'Password changed successfully'
      });

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to change password', 500);
    }
  }

  // Verify Email
  async verifyEmail(data: IVerifyEmailRequest): Promise<{ message: string }> {
    const { token } = data;
    try {
      const user = await User.findOne({
        emailVerificationToken: token, // Use the extracted token
        emailVerificationExpires: { $gt: new Date() }
      });

      if (!user) {
        throw new AppError('Invalid or expired verification token', 400);
      }

      user.isEmailVerified = true;
      user.emailVerificationToken = undefined;
      user.emailVerificationExpires = undefined;
      await user.save();

      try {
        await emailService.sendWelcomeEmail(user.email, user.name);
      } catch (emailError) {
        console.warn('Failed to send welcome email:', emailError);
      }

      return { message: 'Email verified successfully' };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Email verification failed', 500);
    }
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    try {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (user.isEmailVerified) {
        throw new AppError('Email already verified', 400);
      }

      const emailVerificationToken = crypto.randomBytes(32).toString('hex');
      const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

      user.emailVerificationToken = emailVerificationToken;
      user.emailVerificationExpires = emailVerificationExpires;
      await user.save();

      await emailService.sendVerificationEmail(user.email, emailVerificationToken);

      return { message: 'Verification email sent successfully' };

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to resend verification email', 500);
    }
  }

  // Update Profile
  async updateProfile(userId: string, profileData: IUpdateProfileRequest): Promise<IAuthResponse['user']> {
    try {
      const user = await User.findByIdAndUpdate(
        userId,
        {
          $set: profileData
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!user) {
        throw new AppError('User not found', 404);
      }

      const userResponse = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
      };

      return authResponseSchema.shape.user.parse(userResponse);

    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError('Failed to update profile', 500);
    }
  }

  // Logout
  async logout(userId: string): Promise<{ message: string }> {
    try {
      await User.findByIdAndUpdate(userId, {
        $unset: { refreshToken: 1 }
      });

      return messageResponseSchema.parse({
        message: 'Logged out successfully'
      });

    } catch (error) {
      throw new AppError('Failed to logout', 500);
    }
  }
}

export const authService = new AuthService();