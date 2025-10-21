
import dotenv from "dotenv";

dotenv.config();

interface JwtOptions {
  secret: string;
  expiresIn: string;
}
interface JwtConfig {
  access: JwtOptions;
  refresh: JwtOptions;
}

const JWT_CONFIG: JwtConfig = {
  access: {
    secret: process.env.JWT_SECRET || "4f7d9a2b8c6e1f3a5d8b0e2c7a9f4d1b6e8c3a7f2d9b1e5c8a0f3d7e2b9c6a1f",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  },
  refresh: {
    secret: process.env.JWT_REFRESH_SECRET || "8e3c7a1f9d2b6e4c8a0f3d7b1e5c9a2f7d4b8e1c6a3f9d0b2e7c5a8f1d3b6",
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },
};

export default JWT_CONFIG;