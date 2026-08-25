import "./globals.css";

export const metadata = {
  title: "Studio - Gestão",
  description: "Sistema de gestão do studio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
