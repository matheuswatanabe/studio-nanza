import { NextResponse } from "next/server";
import { COOKIE_NAME, COOKIE_PERFIL, PERFIS, tokenEsperado } from "@/lib/auth";

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
    return NextResponse.next();
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
