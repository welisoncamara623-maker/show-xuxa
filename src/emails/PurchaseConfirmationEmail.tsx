import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "react-email";

import { formatCurrencyFromCents } from "@/lib/currency";

export type PurchaseConfirmationEmailProps = {
  customerName?: string;
  orderId: string;
  eventName: string;
  city: string;
  venue: string;
  eventDate: string;
  eventTime: string;
  items: Array<{
    sector: string;
    category: string;
    quantity: number;
    unitPriceInCents: number;
    lineTotalInCents: number;
  }>;
  protectionLabel: string;
  insuranceInCents: number;
  finalTotalInCents: number;
};

function currency(valueInCents: number) {
  return formatCurrencyFromCents(valueInCents);
}

export function PurchaseConfirmationEmail({
  customerName,
  orderId,
  eventName,
  city,
  venue,
  eventDate,
  eventTime,
  items,
  protectionLabel,
  insuranceInCents,
  finalTotalInCents,
}: PurchaseConfirmationEmailProps) {
  const greetingName = customerName?.trim() ? `, ${customerName.trim()}` : "";

  return (
    <Html lang="pt-BR">
      <Head>
        <title>Compra confirmada — Xuxa Tour 2026</title>
      </Head>
      <Preview>
        Seu pagamento foi confirmado. Confira os detalhes da sua compra.
      </Preview>
      <Body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: "#f8fafc",
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          color: "#0f172a",
        }}
      >
        <Section
          style={{
            display: "none",
            maxHeight: 0,
            overflow: "hidden",
            opacity: 0,
          }}
        >
          Seu pagamento foi confirmado. Confira os detalhes da sua compra.
        </Section>

        <Section style={{ width: "100%", backgroundColor: "#f8fafc" }}>
          <Section
            style={{
              maxWidth: "640px",
              margin: "0 auto",
              padding: "32px 16px",
            }}
          >
            <Container
              style={{
                width: "100%",
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "24px",
                overflow: "hidden",
              }}
            >
              <Section style={{ padding: "40px 32px 32px" }}>
                <Heading
                  style={{
                    margin: 0,
                    fontSize: "28px",
                    lineHeight: "36px",
                    letterSpacing: "-0.04em",
                    color: "#0f172a",
                  }}
                >
                  Compra confirmada — Xuxa Tour 2026
                </Heading>

                <Text
                  style={{
                    margin: "16px 0 0",
                    fontSize: "16px",
                    lineHeight: "28px",
                    color: "#334155",
                  }}
                >
                  Olá{greetingName}!
                </Text>

                <Text
                  style={{
                    margin: "12px 0 0",
                    fontSize: "16px",
                    lineHeight: "28px",
                    color: "#334155",
                  }}
                >
                  Seu pagamento foi confirmado e sua compra para a Xuxa Tour
                  2026 foi realizada com sucesso. 🎉
                </Text>

                <Section
                  style={{
                    marginTop: "24px",
                    padding: "20px",
                    borderRadius: "20px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <Text
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      lineHeight: "22px",
                      color: "#64748b",
                    }}
                  >
                    Pedido
                  </Text>
                  <Text
                    style={{
                      margin: "4px 0 0",
                      fontSize: "18px",
                      lineHeight: "28px",
                      fontWeight: 700,
                      color: "#0f172a",
                    }}
                  >
                    {orderId}
                  </Text>

                  <Section style={{ marginTop: "20px" }}>
                    <Text
                      style={{ margin: 0, fontSize: "15px", lineHeight: "24px" }}
                    >
                      <strong>{eventName}</strong>
                    </Text>
                    <Text
                      style={{
                        margin: "6px 0 0",
                        fontSize: "15px",
                        lineHeight: "24px",
                        color: "#334155",
                      }}
                    >
                      {city} • {venue}
                    </Text>
                    <Text
                      style={{
                        margin: "6px 0 0",
                        fontSize: "15px",
                        lineHeight: "24px",
                        color: "#334155",
                      }}
                    >
                      {eventDate} • {eventTime}
                    </Text>
                  </Section>

                  <Section style={{ marginTop: "20px" }}>
                    {items.map((item) => (
                      <Section
                        key={`${item.sector}-${item.category}`}
                        style={{
                          paddingTop: "12px",
                          paddingBottom: "12px",
                          borderTop: "1px solid #e2e8f0",
                        }}
                      >
                        <Text
                          style={{
                            margin: 0,
                            fontSize: "15px",
                            lineHeight: "24px",
                            fontWeight: 600,
                          }}
                        >
                          {item.quantity} × {item.sector}
                        </Text>
                        <Text
                          style={{
                            margin: "4px 0 0",
                            fontSize: "14px",
                            lineHeight: "22px",
                            color: "#475569",
                          }}
                        >
                          {item.category} • {currency(item.unitPriceInCents)} cada
                        </Text>
                        <Text
                          style={{
                            margin: "4px 0 0",
                            fontSize: "15px",
                            lineHeight: "24px",
                            color: "#0f172a",
                          }}
                        >
                          {currency(item.lineTotalInCents)}
                        </Text>
                      </Section>
                    ))}
                  </Section>

                  <Section
                    style={{
                      marginTop: "20px",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "16px",
                    }}
                  >
                    <Text
                      style={{
                        margin: 0,
                        fontSize: "14px",
                        lineHeight: "22px",
                        color: "#64748b",
                      }}
                    >
                      {protectionLabel}
                    </Text>
                    {insuranceInCents > 0 ? (
                      <Text
                        style={{
                          margin: "4px 0 0",
                          fontSize: "15px",
                          lineHeight: "24px",
                          color: "#0f172a",
                        }}
                      >
                        {currency(insuranceInCents)}
                      </Text>
                    ) : null}

                    <Text
                      style={{
                        margin: "16px 0 0",
                        fontSize: "15px",
                        lineHeight: "24px",
                        color: "#64748b",
                      }}
                    >
                      Total final
                    </Text>
                    <Text
                      style={{
                        margin: "4px 0 0",
                        fontSize: "24px",
                        lineHeight: "32px",
                        fontWeight: 700,
                        color: "#0f172a",
                      }}
                    >
                      {currency(finalTotalInCents)}
                    </Text>
                  </Section>
                </Section>

                <Text
                  style={{
                    margin: "24px 0 0",
                    fontSize: "16px",
                    lineHeight: "28px",
                    color: "#334155",
                  }}
                >
                  Em breve você receberá o acesso ao ingresso virtual neste
                  mesmo e-mail.
                </Text>

                <Text
                  style={{
                    margin: "12px 0 0",
                    fontSize: "16px",
                    lineHeight: "28px",
                    color: "#334155",
                  }}
                >
                  Caso não encontre nossas próximas mensagens na caixa de
                  entrada, verifique também as pastas Spam, Lixo eletrônico ou
                  Promoções.
                </Text>

                <Text
                  style={{
                    margin: "12px 0 0",
                    fontSize: "16px",
                    lineHeight: "28px",
                    color: "#334155",
                  }}
                >
                  Guarde este e-mail para consultar os dados da sua compra.
                </Text>

                <Text
                  style={{
                    margin: "24px 0 0",
                    fontSize: "16px",
                    lineHeight: "28px",
                    color: "#334155",
                  }}
                >
                  Obrigado e aproveite o show!
                  <br />
                  Equipe Xuxa Tour 2026
                </Text>

                <Hr
                  style={{
                    margin: "32px 0 0",
                    borderColor: "#e2e8f0",
                  }}
                />

                <Text
                  style={{
                    margin: "16px 0 0",
                    fontSize: "13px",
                    lineHeight: "20px",
                    color: "#94a3b8",
                  }}
                >
                  Este é um e-mail automático relacionado ao pedido {orderId}.
                </Text>
              </Section>
            </Container>
          </Section>
        </Section>
      </Body>
    </Html>
  );
}
