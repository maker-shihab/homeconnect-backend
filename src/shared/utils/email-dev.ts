export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

  console.log('📧 Verification Email:');
  console.log('To:', email);
  console.log('Verification URL:', verificationUrl);
  console.log('---');
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  console.log('📧 Password Reset Email:');
  console.log('To:', email);
  console.log('Reset URL:', resetUrl);
  console.log('---');
};

export const sendEmail = async (options: any): Promise<void> => {
  console.log('📧 Email:', options);
};