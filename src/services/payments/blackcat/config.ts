import "server-only";

export type BlackCatConfig = {
  apiUrl: string;
  publicKey: string;
  privateKey: string;
  splitCode: string;
};

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(
      `Variável de ambiente obrigatória ausente: ${name}`
    );
  }

  return value;
}

function getApiUrl(): string {
  const rawUrl = getRequiredEnv("BLACKCAT_API_URL");

  let url: URL;

  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error("BLACKCAT_API_URL possui um formato inválido.");
  }

  if (url.protocol !== "https:") {
    throw new Error("BLACKCAT_API_URL deve utilizar HTTPS.");
  }

  return `${url.toString().replace(/\/+$/, "")}/`;
}

export function getBlackCatConfig(): BlackCatConfig {
  return Object.freeze({
    apiUrl: getApiUrl(),
    publicKey: getRequiredEnv("BLACKCAT_PUBLIC_KEY"),
    privateKey: getRequiredEnv("BLACKCAT_PRIVATE_KEY"),
    splitCode: getRequiredEnv("BLACKCAT_SPLIT_CODE"),
  });
}
