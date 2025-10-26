import "../styles/globals.css";
import { I18nProvider } from "./i18n";
import { CurrencyProvider } from "./currency";
import { Analytics } from "@vercel/analytics/react";

export const metadata = {
  title: "FIRE路书 / FIRE Atlas",
  description: "通往FIRE的路线与进度 · Your roadmap & progress to FIRE"
};

export default function RootLayout({ children }: { children: React.ReactNode }){
  return (
    <html lang="zh" data-theme="minimal">
      <body>
        <I18nProvider>
          <CurrencyProvider>
            {children}
            <Analytics />
          </CurrencyProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
