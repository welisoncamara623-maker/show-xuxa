export type BlackCatDocumentType = "cpf" | "cnpj";

export type BlackCatCreatePixItem = {
  title: string;
  unitPriceInCents: number;
  quantity: number;
  tangible?: boolean;
};

export type BlackCatCreatePixCustomer = {
  name: string;
  email: string;
  phone: string;
  document: {
    number: string;
    type: BlackCatDocumentType;
  };
};

export type CreatePixPaymentInput = {
  orderId: string;
  customer: {
    email: string;
    name?: string;
    phone?: string;
    document?: {
      number: string;
      type: BlackCatDocumentType;
    };
  };
  amountInCents: number;
  description: string;
  items: BlackCatCreatePixItem[];
  postbackUrl: string;
  expiresInDays?: number;
};

export type PixPaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "expired"
  | "refunded";

export type PixPayment = {
  provider: "blackcat";
  providerPaymentId: string;
  transactionId: string;
  status: PixPaymentStatus;
  amountInCents: number;
  copyPasteCode: string;
  qrCodeImage?: string;
  qrCodeBase64?: string;
  expiresAt?: string;
  paidAt?: string | null;
  endToEndId?: string | null;
};

export type PixPaymentStatusResponse = {
  provider: "blackcat";
  providerPaymentId: string;
  transactionId: string;
  status: PixPaymentStatus;
  amountInCents: number;
  expiresAt?: string;
  paidAt?: string | null;
  endToEndId?: string | null;
};

export type BlackCatCreateSaleRequest = {
  amount: number;
  currency: "BRL";
  paymentMethod: "pix";
  items: Array<{
    title: string;
    unitPrice: number;
    quantity: number;
    tangible?: boolean;
  }>;
  customer: BlackCatCreatePixCustomer;
  pix?: {
    expiresInDays?: number;
  };
  postbackUrl?: string;
  metadata?: string;
  externalRef?: string;
};

export type BlackCatCreateSaleResponse = {
  success: true;
  data: {
    transactionId: string;
    status: "PENDING" | "PAID" | "CANCELLED";
    paymentMethod: string;
    amount: number;
    netAmount: number;
    fees: number;
    invoiceUrl?: string;
    createdAt: string;
    paymentData?: {
      qrCode?: string;
      qrCodeBase64?: string;
      copyPaste?: string;
      expiresAt?: string;
    };
  };
};

export type BlackCatCreateSaleErrorResponse = {
  success: false;
  message: string;
  error?: string;
  code?: string;
};

export type BlackCatCreateSaleApiResponse =
  | BlackCatCreateSaleResponse
  | BlackCatCreateSaleErrorResponse;

export type BlackCatTransactionStatusResponse = {
  success: true;
  data: {
    transactionId: string;
    status: "PENDING" | "PAID" | "CANCELLED" | "REFUNDED";
    paymentMethod: string;
    amount: number;
    netAmount: number;
    fees: number;
    paidAt?: string | null;
    endToEndId?: string | null;
  };
};
