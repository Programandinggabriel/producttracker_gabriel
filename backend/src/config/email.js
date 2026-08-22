import dotenv from 'dotenv';

dotenv.config()

export const emailConfig = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD
};