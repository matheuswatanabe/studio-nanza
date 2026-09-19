import { NextResponse } from "next/server";
import { COOKIE_ESTADO_GOOGLE, googleConfigurado, urlDeAutorizacao } from "@/lib/google";
import { origemDe } from "@/lib/origem";

// Começa a conexão: manda a pessoa para a tela de autorização do Google.
// O `estado` aleatório volta junto na resposta do Google e é conferido no
// callback — garante que o retorno veio de uma conexão iniciada aqui, e não
// de um link forjado tentando ligar a agenda do site a outra conta.
export async function GET(request) {
  const origem = origemDe(request.headers);

  if (!googleConfigurado()) {
    return NextResponse.redirect(`${origem}/agenda?google=nao-configurado`);
  }

  const estado = crypto.randomUUID();
  const resposta = NextResponse.redirect(urlDeAutorizacao({ origem, estado }));

  resposta.cookies.set(COOKIE_ESTADO_GOOGLE, estado, {
    httpOnly: true,
    secure: true,
    // Lax (e não Strict) para o cookie voltar junto quando o Google
    // redireciona de volta para o site.
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/api/google",
  });

  return resposta;
}
