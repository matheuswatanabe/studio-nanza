import Clientes from "@/components/clientes/Clientes";
import { comoJson, listarClientes } from "@/lib/consultas";

// Busca os clientes aqui no servidor, para a página já chegar pronta ao
// navegador — sem abrir vazia e só depois pedir os dados à API.
export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const clientes = comoJson(await listarClientes());
  return <Clientes clientesIniciais={clientes} />;
}
