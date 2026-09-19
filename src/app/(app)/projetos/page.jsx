import Projetos from "@/components/projetos/Projetos";
import { comoJson, listarClientes, listarProjetos } from "@/lib/consultas";

// Busca clientes e projetos aqui no servidor, em paralelo, para a página já
// chegar pronta ao navegador — sem abrir vazia e só depois pedir à API.
export const dynamic = "force-dynamic";

export default async function ProjetosPage() {
  const [clientes, projetos] = await Promise.all([listarClientes(), listarProjetos()]);
  return <Projetos clientesIniciais={comoJson(clientes)} projetosIniciais={comoJson(projetos)} />;
}
