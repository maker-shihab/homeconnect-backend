// modules/auth/auth.interface.ts
export interface ILoginRequest {
  email: string;
  password: string;
}
export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'tenant' | 'landlord' | 'admin' | 'support';
  phone?: string;
  avatar?: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string | null;
    phone?: string;
  };
  token: string;
  expiresIn: string;
  refreshToken?: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}

export interface IForgotPasswordRequest {
  email: string;
}

export interface IResetPasswordRequest {
  token: string;
  password: string;
}

export interface IChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface IVerifyEmailRequest {
  token: string;
}

export interface IUpdateProfileRequest {
  name?: string;
  phone?: string;
  avatar?: string;
}