import { sendVerificationEmail } from "../../shared/utils/email";
import { IAuthResponse } from "./auth.interface";

  async register(userData: IRegisterRequest): Promise < IAuthResponse > {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if user already exists within transaction
    const existingUser = await User.findOne({ email: userData.email }).session(session);
    if(existingUser) {
      await session.abortTransaction();
      throw new AppError('User already exists with this email', 400);
    }

      // Validate phone number if provided
      if(userData.phone) {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phoneRegex.test(userData.phone)) {
    await session.abortTransaction();
    throw new AppError('Invalid phone number format', 400);
  }
}

// Hash password
const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(userData.password, salt);

// Create email verification token
const emailVerificationToken = crypto.randomBytes(32).toString('hex');
const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

// Create user within transaction
const user = await User.create([{
  ...userData,
  password: hashedPassword,
  emailVerificationToken,
  emailVerificationExpires,
  isEmailVerified: false,
  isActive: true,
}], { session });

const createdUser = user[0];

// Generate tokens
const tokenPayload = {
  userId: createdUser._id.toString(),
  email: createdUser.email,
  role: createdUser.role,
};

const { token, expiresIn } = this.generateToken(tokenPayload);
const refreshToken = this.generateRefreshToken(tokenPayload);

// Save refresh token to user within transaction
await User.findByIdAndUpdate(
  createdUser._id,
  { refreshToken },
  { session }
);

// Commit the transaction
await session.commitTransaction();

// Send verification email (outside transaction)
try {
  await sendVerificationEmail(createdUser.email, emailVerificationToken);
} catch (emailError) {
  console.warn('Failed to send verification email:', emailError);
  // Don't throw error - registration should still succeed
}

const authResponse: IAuthResponse = {
  user: {
    id: createdUser._id.toString(),
    name: createdUser.name,
    email: createdUser.email,
    role: createdUser.role,
    avatar: createdUser.avatar,
    phone: createdUser.phone,
  },
  token,
  expiresIn,
  refreshToken,
};

return authResponseSchema.parse(authResponse);

    } catch (error: unknown) { // Explicitly type error as unknown
  // Always abort transaction on error
  await session.abortTransaction();

  if (error instanceof AppError) {
    throw error;
  }

  // Handle duplicate key errors (if transaction didn't catch it)
  if (this.isDuplicateKeyError(error)) {
    throw new AppError('User already exists with this email', 400);
  }

  console.error('Registration error:', error);
  throw new AppError('Registration failed', 500);
} finally {
  // Always end session
  session.endSession();
}
  }