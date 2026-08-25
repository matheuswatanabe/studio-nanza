import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata = {
  title: "Studio - Gestão",
  description: "Sistema de gestão local para o studio",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body className="flex bg-neutral-50">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
