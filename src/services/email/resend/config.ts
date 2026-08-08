import "server-only";

function getRequiredEnv(name: string): string {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Variável de ambiente obrigatória ausente: ${name}`);
  }

  return value;
}

export function getResendConfig() {
  return {
    apiKey: getRequiredEnv("RESEND_API_KEY"),
    fromEmail: getRequiredEnv("RESEND_FROM_EMAIL"),
  } as const;
}
