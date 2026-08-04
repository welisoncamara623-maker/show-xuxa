export type BlackCatPixCustomer = {
  name: string;
  email: string;
};

export type BlackCatPixItem = {
  id: string;
  description: string;
  quantity: number;
  unitAmountInCents: number;
};

export type BlackCatCreatePixChargeInput = {
  showId: string;
  customer: BlackCatPixCustomer;
  items: BlackCatPixItem[];
  totalAmountInCents: number;
  expiresInMinutes: number;
};

export type BlackCatCreatePixChargeResult = {
  chargeId: string;
  pixQrCode: string;
  pixCopyPaste: string;
  expiresAt: string;
};
