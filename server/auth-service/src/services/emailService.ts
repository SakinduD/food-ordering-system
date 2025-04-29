import nodemailer, { Transporter } from 'nodemailer';

// Type definition for email sending functions
interface EmailService {
  sendOtpEmail(to: string, otp: string): Promise<void>;
  sendConfirmationEmail(to: string): Promise<void>;
  sendPasswordResetEmail(to: string, name: string, resetUrl: string): Promise<void>;
  sendPasswordChangedEmail(to: string, name: string, loginUrl: string): Promise<void>;
}

// Create email transporter with proper error handling
const createTransporter = (): Transporter => {
  // Check if credentials are available
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
    console.warn('Email credentials not properly configured. Check your environment variables.');
  }

  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS, // Support both env variable names
    },
    tls: {
      rejectUnauthorized: process.env.NODE_ENV === 'production' // For development environments
    }
  });
};

const transporter: Transporter = createTransporter();

// Check if email is properly configured
const isEmailConfigured = () => {
  return process.env.EMAIL_USER && (process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS);
};

// Development email fallback
const sendEmailSafely = async (mailOptions: any): Promise<any> => {
  // In development mode, if email is not configured, just log the email content
  if (process.env.NODE_ENV !== 'production' && !isEmailConfigured()) {
    console.log('\n-------- DEVELOPMENT MODE: EMAIL NOT SENT --------');
    console.log('To:', mailOptions.to);
    console.log('Subject:', mailOptions.subject);
    console.log('Email content type:', mailOptions.html ? 'HTML' : 'Text');
    if (!mailOptions.html) {
      console.log('Content:', mailOptions.text);
    }
    console.log('------------------------------------------------\n');
    
    return Promise.resolve({ messageId: 'dev-mode-email-not-sent' });
  }
  
  // Otherwise try to send the actual email
  return transporter.sendMail(mailOptions);
};

const sendOtpEmail: EmailService['sendOtpEmail'] = async (to, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6b35; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Your Verification Code</h2>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 20px;">
          <p>Your verification code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="font-size: 32px; font-weight: bold; letter-spacing: 4px; padding: 15px; background-color: #f7f7f7; border-radius: 8px; display: inline-block;">
              ${otp}
            </div>
          </div>
          <p>This code will expire in 10 minutes. If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>The FoodFast Team</p>
        </div>
      </div>
    `
  };

  await sendEmailSafely(mailOptions);
};

const sendConfirmationEmail: EmailService['sendConfirmationEmail'] = async (to) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Account Verified',
    text: 'Your registration has been successfully verified!',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6b35; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Account Verified</h2>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 20px;">
          <p>Congratulations! Your account has been successfully verified.</p>
          <p>You can now log in and enjoy all the features of our platform.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              Log in to Your Account
            </a>
          </div>
          <p>Best regards,<br>The FoodFast Team</p>
        </div>
      </div>
    `
  };

  await sendEmailSafely(mailOptions);
};

const sendPasswordResetEmail: EmailService['sendPasswordResetEmail'] = async (to, name, resetUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@foodfast.com',
    to,
    subject: 'Password Reset - FoodFast',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6b35; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Reset Your Password</h2>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 20px;">
          <p>Hello ${name},</p>
          <p>You recently requested to reset your password for your FoodFast account. Click the button below to reset it.</p>
          <p>This password reset link is only valid for the next 60 minutes.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Your Password</a>
          </div>
          <p>If you did not request a password reset, please ignore this email or contact support if you have questions.</p>
          <p>Best regards,<br>The FoodFast Team</p>
        </div>
        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} FoodFast. All rights reserved.
        </p>
      </div>
    `
  };

  await sendEmailSafely(mailOptions);
};

const sendPasswordChangedEmail: EmailService['sendPasswordChangedEmail'] = async (to, name, loginUrl) => {
  const mailOptions = {
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@foodfast.com',
    to,
    subject: 'Your Password Has Been Changed - FoodFast',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #ff6b35; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h2 style="color: white; margin: 0;">Password Changed Successfully</h2>
        </div>
        <div style="border: 1px solid #ddd; border-top: none; border-radius: 0 0 10px 10px; padding: 20px;">
          <p>Hello ${name},</p>
          <p>Your password has been successfully changed. You can now login to your account with your new password.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="background-color: #ff6b35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Login to Your Account</a>
          </div>
          <p>If you did not make this change, please contact our support team immediately.</p>
          <p>Best regards,<br>The FoodFast Team</p>
        </div>
        <p style="text-align: center; color: #888; font-size: 12px; margin-top: 20px;">
          &copy; ${new Date().getFullYear()} FoodFast. All rights reserved.
        </p>
      </div>
    `
  };

  await sendEmailSafely(mailOptions);
};

export { 
  sendOtpEmail, 
  sendConfirmationEmail, 
  sendPasswordResetEmail, 
  sendPasswordChangedEmail,
  isEmailConfigured 
};
