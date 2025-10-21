import nodemailer from 'nodemailer';
import { AppError } from './AppError';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    if (process.env.NODE_ENV === 'development') {
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // For production
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'HomeConnect <noreply@homeconnect.com>',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };

      if (process.env.NODE_ENV === 'development') {
        console.log('📧 Email would be sent:');
        console.log('To:', options.to);
        console.log('Subject:', options.subject);
        console.log('HTML Content:', options.html);
        console.log('---');

        // For development, you can also create a test email account
        if (process.env.SMTP_USER?.includes('ethereal')) {
          const info = await this.transporter.sendMail(mailOptions);
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
        return;
      }

      // For production
      await this.transporter.sendMail(mailOptions);
      console.log(`Email sent successfully to: ${options.to}`);

    } catch (error) {
      console.error('Email sending failed:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Verify Your Email - HomeConnect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px; }
                .footer { margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to HomeConnect! 🏠</h2>
                <p>Thank you for registering with HomeConnect. To complete your registration, please verify your email address by clicking the button below:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${verificationUrl}" class="button">Verify Email Address</a>
                </div>
                
                <p>Or copy and paste this link in your browser:</p>
                <p>${verificationUrl}</p>
                
                <div class="footer">
                    <p>This verification link will expire in 24 hours.</p>
                    <p>If you didn't create an account with HomeConnect, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Welcome to HomeConnect! Please verify your email by clicking: ${verificationUrl}`
    });
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - HomeConnect',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
                .button { display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px; }
                .footer { margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Password Reset Request</h2>
                <p>You requested to reset your password for your HomeConnect account. Click the button below to reset your password:</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetUrl}" class="button">Reset Password</a>
                </div>
                
                <p>Or copy and paste this link in your browser:</p>
                <p>${resetUrl}</p>
                
                <div class="footer">
                    <p>This reset link will expire in 1 hour.</p>
                    <p>If you didn't request a password reset, please ignore this email and your password will remain unchanged.</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Reset your password by clicking: ${resetUrl}`
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    await this.sendEmail({
      to: email,
      subject: 'Welcome to HomeConnect!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                .container { max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif; }
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to HomeConnect, ${name}! 🎉</h2>
                <p>Your account has been successfully verified and you're now part of our community.</p>
                <p>You can now:</p>
                <ul>
                    <li>Browse available properties</li>
                    <li>Save your favorite listings</li>
                    <li>Contact landlords directly</li>
                    <li>Manage your profile</li>
                </ul>
                <p>Start exploring now and find your perfect home!</p>
                <div class="footer">
                    <p>Happy house hunting!</p>
                    <p>The HomeConnect Team</p>
                </div>
            </div>
        </body>
        </html>
      `,
      text: `Welcome to HomeConnect, ${name}! Your account is now verified. Start exploring properties now!`
    });
  }
}

export const emailService = new EmailService();

// Export individual functions for backward compatibility
export const sendEmail = emailService.sendEmail.bind(emailService);
export const sendVerificationEmail = emailService.sendVerificationEmail.bind(emailService);
export const sendPasswordResetEmail = emailService.sendPasswordResetEmail.bind(emailService);