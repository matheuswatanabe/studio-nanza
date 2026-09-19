import { headers } from "next/headers";
import Agenda from "@/components/Agenda";
import { tokenAgenda } from "@/lib/auth";
import { origemDe } from "@/lib/origem";

// O endereço de assinatura depende do domínio da requisição e do token
// derivado da senha do sistema — os dois só existem no servidor.
export const dynamic = "force-dynamic";

export default async function AgendaPage({ searchParams }) {
  const origem = origemDe(await headers());
  const token = await tokenAgenda();
  const urlFeed = origem ? `${origem}/api/agenda/ics?token=${token}` : "";

  // Resultado da volta do Google depois de conectar a conta (?google=...),
  // lido aqui para a tela mostrar o aviso certo ao abrir.
  const retornoGoogle = searchParams?.google
    ? { status: searchParams.google, motivo: searchParams.motivo ?? null }
    : null;

  return <Agenda urlFeed={urlFeed} retornoGoogle={retornoGoogle} />;
}
