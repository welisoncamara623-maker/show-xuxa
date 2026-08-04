export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function toCents(value: number): number {
  return Math.round(value * 100);
}

export function fromCents(value: number): number {
  return value / 100;
}

export function formatCurrencyBRL(value: number) {
  return currencyFormatter.format(value);
}

export function formatIntegerBRL(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}
