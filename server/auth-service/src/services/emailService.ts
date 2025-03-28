import nodemailer, { Transporter } from 'nodemailer';

// Type definition for email sending functions
interface EmailService {
  sendOtpEmail(to: string, otp: string): Promise<void>;
  sendConfirmationEmail(to: string): Promise<void>;
}

const transporter: Transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!
  }
});

const sendOtpEmail: EmailService['sendOtpEmail'] = async (to, otp) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Your OTP Code',
    text: `Your OTP is ${otp}`
  });
};

const sendConfirmationEmail: EmailService['sendConfirmationEmail'] = async (to) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: 'Account Verified',
    text: 'Your registration has been successfully verified!'
  });
};

export { sendOtpEmail, sendConfirmationEmail };
