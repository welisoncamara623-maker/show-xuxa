import "server-only";

import { Resend } from "resend";

import { getResendConfig } from "./config";

let resendClient: Resend | undefined;

export function getResendClient(): Resend {
  if (!resendClient) {
    const { apiKey } = getResendConfig();

    resendClient = new Resend(apiKey);
  }

  return resendClient;
}
