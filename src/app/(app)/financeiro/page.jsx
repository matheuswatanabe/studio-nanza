import Financeiro from "@/components/financeiro/Financeiro";
import { comoJson, listarProjetos, listarTransacoes } from "@/lib/consultas";

// Busca transações e projetos aqui no servidor, em paralelo, para a página já
// chegar pronta ao navegador — sem abrir vazia e só depois pedir à API.
export const dynamic = "force-dynamic";

export default async function FinanceiroPage() {
  const [transacoes, projetos] = await Promise.all([listarTransacoes(), listarProjetos()]);
  return (
    <Financeiro transacoesIniciais={comoJson(transacoes)} projetosIniciais={comoJson(projetos)} />
  );
}
