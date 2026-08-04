import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Show da Xuxa",
  description: "Escolha seu show e veja os detalhes do evento.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#f5f6f8] text-slate-900">
        {children}
      </body>
    </html>
  );
}
