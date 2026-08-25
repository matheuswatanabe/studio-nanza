import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  COOKIE_PERFIL,
  PERFIS,
  SESSAO_MAX_AGE,
  tokenEsperado,
} from "@/lib/auth";

const COOKIE_OPCOES = {
  httpOnly: true,
  secure: true,
  sameSite: "lax",
  maxAge: SESSAO_MAX_AGE,
  path: "/",
};

// Renova a validade dos cookies de sessão a cada requisição autenticada,
// para que ninguém seja deslogado no meio de uma tarefa — só expira de
// verdade quem ficar SESSAO_MAX_AGE sem interagir com o sistema.
function renovarSessao(response, request, { incluirPerfil }) {
  response.cookies.set(COOKIE_NAME, request.cookies.get(COOKIE_NAME).value, COOKIE_OPCOES);

  const perfil = request.cookies.get(COOKIE_PERFIL)?.value;
  if (incluirPerfil && perfil) {
    response.cookies.set(COOKIE_PERFIL, perfil, COOKIE_OPCOES);
  }

  return response;
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (
    pathname === "/login" ||
    pathname === "/api/login" ||
    pathname === "/api/logout"
  ) {
    return NextResponse.next();
  }

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  const esperado = await tokenEsperado();
  const autenticado = Boolean(cookie) && cookie === esperado;

  if (!autenticado) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Não autenticado." }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (pathname === "/perfil" || pathname === "/api/perfil") {
    return renovarSessao(NextResponse.next(), request, { incluirPerfil: false });
  }

  const perfil = request.cookies.get(COOKIE_PERFIL)?.value;
  const perfilValido = Boolean(perfil) && PERFIS.includes(perfil);

  if (!perfilValido) {
    if (pathname.startsWith("/api")) {
      return NextResponse.json({ error: "Selecione um perfil." }, { status: 401 });
    }

    const url = request.nextUrl.clone();
    url.pathname = "/perfil";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return renovarSessao(NextResponse.next(), request, { incluirPerfil: true });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
