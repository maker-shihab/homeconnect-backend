export const APP_CONSTANTS = {
  JWT_EXPIRES_IN: '7d',
  BCRYPT_SALT_ROUNDS: 12,
  PAGINATION_LIMIT: 10,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
};

export const USER_ROLES = {
  STUDENT: 'student',
  LANDLORD: 'landlord',
  ADMIN: 'admin',
} as const;

export const PROPERTY_STATUS = {
  AVAILABLE: 'available',
  RENTED: 'rented',
  MAINTENANCE: 'maintenance',
} as const;