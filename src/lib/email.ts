import nodemailer from "nodemailer";
import { env } from "process";
import type { SendMailOptions } from "nodemailer";
import { logger } from "@/lib/logger";

const hasOauthConfig =
  !!env.GOOGLE_CLIENT_ID &&
  !!env.GOOGLE_CLIENT_SECRET &&
  !!env.GOOGLE_REFRESH_TOKEN;

if (!hasOauthConfig) {
  throw new Error(
    "Email transport is not configured. Set GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET/GOOGLE_REFRESH_TOKEN.",
  );
}

const nodemailerClient = hasOauthConfig
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

export async function sendMail(mailOptions: SendMailOptions) {
  if (!nodemailerClient) {
    throw new Error("No OAuth email transport available.");
  }

  return nodemailerClient.sendMail(mailOptions, (error, info) => {
    if (error) {
      logger.error({ action: 'send_mail', outcome: 'error', error: { message: error.message, type: error.name } });
      return;
    }
    logger.info({ action: 'send_mail', outcome: 'success', message_id: info.messageId });
  });
}
