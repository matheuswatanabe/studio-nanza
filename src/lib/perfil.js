import { cookies } from "next/headers";
import { COOKIE_PERFIL, PERFIS } from "@/lib/auth";

// Lê o perfil (Natan/Lucas/Matheus) de quem está fazendo a requisição, para
// gravar em `criado_por` nos inserts. Só usado em rotas de API (Node.js
// runtime) — o middleware, que roda no Edge, já garante que essa cookie
// existe e é válida antes de deixar a requisição chegar aqui.
export async function perfilAtual() {
  const cookieStore = await cookies();
  const valor = cookieStore.get(COOKIE_PERFIL)?.value;
  return PERFIS.includes(valor) ? valor : null;
}
