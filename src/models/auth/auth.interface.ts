export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'student' | 'landlord';
  phone?: string;
}

export interface IAuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
  };
  token: string;
  expiresIn: string;
}

export interface ITokenPayload {
  userId: string;
  email: string;
  role: string;
}