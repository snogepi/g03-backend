import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_USER,
      subject,
      text,
      html,
    };

    const response = await sgMail.send(msg);
    console.log('Email sent via SendGrid:', response[0].statusCode);
    return { success: true, status: response[0].statusCode };
  } catch (error) {
    console.error('SendGrid error:', error.response?.body || error.message);
    return { success: false, error: error.message };
  }
};
