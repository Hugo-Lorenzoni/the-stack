import nodemailer from "nodemailer";
import { env } from "process";

const hasOauthConfig =
  !!env.GOOGLE_CLIENT_ID &&
  !!env.GOOGLE_CLIENT_SECRET &&
  !!env.GOOGLE_REFRESH_TOKEN;

if (!env.EMAIL_PASSWORD && !hasOauthConfig) {
  throw new Error(
    "Email transport is not configured. Set EMAIL_PASSWORD or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN.",
  );
}

export const nodemailerClient = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: env.EMAIL_PASSWORD
    ? {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      }
    : {
        type: "OAuth2",
        user: env.EMAIL,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GOOGLE_REFRESH_TOKEN,
        accessToken: env.GOOGLE_ACCESS_TOKEN,
      },
});
