import "server-only";

import { getBlackCatConfig } from "./config";
import { BlackCatHttpError, BlackCatTimeoutError } from "./errors";

type BlackCatFetchInit = Omit<RequestInit, "body"> & {
  body?: string;
};

function buildHeaders(headers?: HeadersInit) {
  const { privateKey } = getBlackCatConfig();
  const nextHeaders = new Headers(headers);
  nextHeaders.set("Content-Type", "application/json");
  nextHeaders.set("X-API-Key", privateKey);
  return nextHeaders;
}

export async function blackCatFetchJson<T>(
  path: string,
  init: BlackCatFetchInit
): Promise<T> {
  const { apiUrl } = getBlackCatConfig();
  const url = new URL(path, `${apiUrl}/`);
  const timeoutSignal =
    typeof AbortSignal.timeout === "function"
      ? AbortSignal.timeout(15_000)
      : undefined;

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: buildHeaders(init.headers),
      signal: timeoutSignal,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new BlackCatTimeoutError("Tempo limite atingido ao chamar a BlackCat.");
    }

    throw error;
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new BlackCatHttpError(
      `A BlackCat respondeu com erro HTTP ${response.status}.`,
      response.status,
      responseText
    );
  }

  if (!responseText) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
}
