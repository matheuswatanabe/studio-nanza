import { Inter, Schibsted_Grotesk } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// Substituta gratuita da Neue Montreal (que é paga) nos títulos: mesma
// pegada neo-grotesca. Quando os arquivos .woff2 da Neue Montreal forem
// adicionados, ela assume sozinha — ver `display` no tailwind.config.js.
const grotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-grotesk",
});

export const metadata = {
  title: "Studio - Gestão",
  description: "Sistema de gestão do studio",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${grotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
