import type {
  BlackCatCreatePixChargeInput,
  BlackCatCreatePixChargeResult,
} from "./types";
import { BLACKCAT_PAYMENT_METHOD } from "./config";

export async function createPixCharge(
  input: BlackCatCreatePixChargeInput
): Promise<BlackCatCreatePixChargeResult> {
  // A cobrança Pix será criada no servidor pela integração BlackCat.
  void input;
  void BLACKCAT_PAYMENT_METHOD;
  throw new Error("BlackCat Pix charge integration is not implemented yet.");
}
