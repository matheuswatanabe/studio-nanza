import { headers } from "next/headers";
import Agenda from "@/components/Agenda";
import { tokenAgenda } from "@/lib/auth";

// O endereço de assinatura depende do domínio da requisição e do token
// derivado da senha do sistema — os dois só existem no servidor.
export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const cabecalhos = await headers();
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host");
  const protocolo =
    cabecalhos.get("x-forwarded-proto") ??
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1")
      ? "http"
      : "https");

  const token = await tokenAgenda();
  const urlFeed = host ? `${protocolo}://${host}/api/agenda/ics?token=${token}` : "";

  return <Agenda urlFeed={urlFeed} />;
}
