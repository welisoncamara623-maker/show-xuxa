import "server-only";

import { render } from "react-email";

import { PurchaseConfirmationEmail } from "@/emails/PurchaseConfirmationEmail";

import type { SendPurchaseConfirmationInput } from "./send-purchase-confirmation";

export async function renderPurchaseConfirmationEmailHtml(
  input: SendPurchaseConfirmationInput
): Promise<string> {
  return render(<PurchaseConfirmationEmail {...input} />);
}
