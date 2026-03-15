import nodemailer from "nodemailer";
import { env } from "process";
import type { SendMailOptions } from "nodemailer";

const hasOauthConfig =
  !!env.GOOGLE_CLIENT_ID &&
  !!env.GOOGLE_CLIENT_SECRET &&
  !!env.GOOGLE_REFRESH_TOKEN;

if (!env.EMAIL_PASSWORD && !hasOauthConfig) {
  throw new Error(
    "Email transport is not configured. Set EMAIL_PASSWORD or GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN.",
  );
}

const smtpBaseConfig = {
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
};

const passwordTransport = env.EMAIL_PASSWORD
  ? nodemailer.createTransport({
      ...smtpBaseConfig,
      auth: {
        user: env.EMAIL,
        pass: env.EMAIL_PASSWORD,
      },
    })
  : null;

const oauthTransport = hasOauthConfig
  ? nodemailer.createTransport({
      ...smtpBaseConfig,
      auth: {
        type: "OAuth2",
        user: env.EMAIL,
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        refreshToken: env.GOOGLE_REFRESH_TOKEN,
      },
    })
  : null;

export const nodemailerClient = passwordTransport ?? oauthTransport;

function isOauthAuthFailure(error: unknown) {
  if (!error || typeof error !== "object") {
    return false;
  }

  const authError = error as {
    code?: string;
    command?: string;
    message?: string;
  };

  return (
    authError.code === "EAUTH" ||
    authError.command === "AUTH XOAUTH2" ||
    /invalid_grant/i.test(authError.message ?? "")
  );
}

export async function sendMailWithFallback(mailOptions: SendMailOptions) {
  if (passwordTransport && !oauthTransport) {
    return passwordTransport.sendMail(mailOptions);
  }

  if (oauthTransport) {
    try {
      return await oauthTransport.sendMail(mailOptions);
    } catch (error) {
      if (passwordTransport && isOauthAuthFailure(error)) {
        console.warn(
          "OAuth2 email auth failed, retrying with EMAIL_PASSWORD transport.",
        );
        return passwordTransport.sendMail(mailOptions);
      }

      throw error;
    }
  }

  if (passwordTransport) {
    return passwordTransport.sendMail(mailOptions);
  }

  throw new Error("No email transport available.");
}
