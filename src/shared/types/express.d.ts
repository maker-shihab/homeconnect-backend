import { ITokenPayload } from "../../models/auth/auth.interface";

declare global {
  namespace Express {
    interface Request {
      user?: ITokenPayload & {
        userId: string;
      };
    }
  }
}

export {};
