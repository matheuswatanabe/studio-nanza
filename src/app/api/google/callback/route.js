import { NextResponse } from "next/server";
import { COOKIE_ESTADO_GOOGLE, concluirConexao } from "@/lib/google";
import { origemDe } from "@/lib/origem";
import { perfilAtual } from "@/lib/perfil";

// Para onde o Google devolve a pessoa depois da tela de autorização. A rota
// continua atrás do login do site (o navegador volta com o cookie de sessão),
// então só quem está logado consegue concluir uma conexão.
export async function GET(request) {
  const origem = origemDe(request.headers);
  const { searchParams } = new URL(request.url);

  const voltar = (params) => {
    const resposta = NextResponse.redirect(`${origem}/agenda?${new URLSearchParams(params)}`);
    resposta.cookies.delete({ name: COOKIE_ESTADO_GOOGLE, path: "/api/google" });
    return resposta;
  };

  // A pessoa clicou em "Cancelar" na tela do Google.
  if (searchParams.get("error")) {
    return voltar({ google: "cancelado" });
  }

  const estadoEsperado = request.cookies.get(COOKIE_ESTADO_GOOGLE)?.value;
  if (!estadoEsperado || searchParams.get("state") !== estadoEsperado) {
    return voltar({
      google: "erro",
      motivo: "A conexão expirou ou não foi iniciada por aqui. Clique em conectar de novo.",
    });
  }

  try {
    await concluirConexao({
      codigo: searchParams.get("code"),
      origem,
      conectadoPor: await perfilAtual(),
    });
    return voltar({ google: "conectado" });
  } catch (erro) {
    return voltar({ google: "erro", motivo: erro.message ?? "Falha ao conectar." });
  }
}
