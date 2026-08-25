import { cookies } from "next/headers";
import Sidebar from "@/components/Sidebar";
import { COOKIE_PERFIL, PERFIS } from "@/lib/auth";

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();
  const valor = cookieStore.get(COOKIE_PERFIL)?.value;
  const perfil = PERFIS.includes(valor) ? valor : null;

  return (
    <div className="flex bg-neutral-50">
      <Sidebar perfil={perfil} />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
