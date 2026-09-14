import { Inter, Rubik, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-rubik",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  variable: "--font-nunito",
});

export const metadata = {
  title: "Studio - Gestão",
  description: "Sistema de gestão do studio",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${rubik.variable} ${nunito.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
