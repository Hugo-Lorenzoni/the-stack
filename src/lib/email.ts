import nodemailer from "nodemailer";
import { env } from "process";

export const nodemailerClient = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    type: "OAuth2",
    user: env.EMAIL,
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    refreshToken: env.GOOGLE_REFRESH_TOKEN,
    accessToken: env.GOOGLE_ACCESS_TOKEN,
  },
});
