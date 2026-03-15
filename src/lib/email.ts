import nodemailer from "nodemailer";
import { env } from "process";
import type { SendMailOptions } from "nodemailer";

const hasOauthConfig =
  !!env.GOOGLE_CLIENT_ID &&
  !!env.GOOGLE_CLIENT_SECRET &&
  !!env.GOOGLE_REFRESH_TOKEN;

if (!hasOauthConfig) {
  throw new Error(
    "Email transport is not configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN.",
  );
}

const oauthTransport = hasOauthConfig
  ? nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: env.EMAIL,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GOOGLE_REFRESH_TOKEN,
      },
    })
  : null;

export const nodemailerClient = oauthTransport;

export async function sendMail(mailOptions: SendMailOptions) {
  if (!oauthTransport) {
    throw new Error("No OAuth email transport available.");
  }

  return oauthTransport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log("Error occurred:", error);
    }
    console.log("Message sent: %s", info.messageId);
  });
}
