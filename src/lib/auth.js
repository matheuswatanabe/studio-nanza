// Autenticação simples de senha única para o sistema inteiro.
// Não é multiusuário nem tem contas — é só uma trava para impedir que
// qualquer pessoa com o link do site acesse os dados do studio.
export const COOKIE_NAME = "studio_auth";

// Depois da senha, cada pessoa escolhe seu perfil (sem senha própria) só
// para identificar quem lançou cada cliente/projeto/transação.
export const COOKIE_PERFIL = "studio_perfil";
export const PERFIS = ["Natan", "Lucas", "Matheus"];

// Usa Web Crypto (disponível tanto no middleware, que roda no Edge Runtime,
// quanto nas rotas de API, que rodam no Node.js) para gerar um token
// derivado da senha — em vez de guardar a senha em texto puro no cookie.
export async function tokenEsperado() {
  const encoder = new TextEncoder();
  const data = encoder.encode("studio-auth:" + (process.env.APP_PASSWORD ?? ""));
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
