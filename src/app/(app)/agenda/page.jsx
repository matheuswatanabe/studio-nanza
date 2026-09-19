import { headers } from "next/headers";
import Agenda from "@/components/agenda/Agenda";
import { tokenAgenda } from "@/lib/auth";
import { listarCompromissos } from "@/lib/compromissos";
import { comoJson, listarProjetos } from "@/lib/consultas";
import { statusDaIntegracao } from "@/lib/google";
import { origemDe } from "@/lib/origem";

// O endereço de assinatura depende do domínio da requisição e do token
// derivado da senha do sistema — os dois só existem no servidor. Os dados
// também são buscados aqui, para a agenda já chegar desenhada.
export const dynamic = "force-dynamic";

const ERRO_AGENDA =
  'Não foi possível carregar a agenda. Se esta é a primeira vez que você abre a agenda, rode o bloco "compromissos" do arquivo supabase/schema.sql no SQL Editor do Supabase.';

export default async function AgendaPage({ searchParams }) {
  const origem = origemDe(await headers());

  // Tudo em paralelo. Cada parte tem sua própria rede de segurança: se a
  // tabela da agenda ou a da integração com o Google ainda não existirem
  // neste banco, a página abre com um aviso em vez de quebrar inteira.
  const [token, compromissos, projetos, google] = await Promise.all([
    tokenAgenda(),
    listarCompromissos().catch(() => null),
    listarProjetos().catch(() => []),
    statusDaIntegracao({ origem }).catch(() => ({
      configurado: false,
      conectado: false,
      uriDeRetorno: "",
    })),
  ]);

  const urlFeed = origem ? `${origem}/api/agenda/ics?token=${token}` : "";

  // Resultado da volta do Google depois de conectar a conta (?google=...),
  // lido aqui para a tela mostrar o aviso certo ao abrir.
  const retornoGoogle = searchParams?.google
    ? { status: searchParams.google, motivo: searchParams.motivo ?? null }
    : null;

  const dadosIniciais = comoJson({
    compromissos: compromissos ?? [],
    projetos,
    google,
    erro: compromissos === null ? ERRO_AGENDA : "",
  });

  return (
    <Agenda urlFeed={urlFeed} retornoGoogle={retornoGoogle} dadosIniciais={dadosIniciais} />
  );
}
