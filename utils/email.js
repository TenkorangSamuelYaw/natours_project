import nodemailer from 'nodemailer';
import crypto from 'crypto';

// NOTE Accepts an object of arguments as options variable
const sendEmail = async options => {
    // 1. Create a transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    // 2. Define the email options
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };
    // 3. Send email with nodemailer
    await transporter.sendMail(mailOptions);
}

export default sendEmail;