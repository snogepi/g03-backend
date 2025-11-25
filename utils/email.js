import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to, subject, text, html = null) => {
  console.log('Attempting to send email to:', to, 'Subject:', subject);
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };
    console.log('Mail options:', mailOptions);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent via nodemailer:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Nodemailer error:', error.message);
    return { success: false, error: error.message };
  }
};