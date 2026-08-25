import { NextResponse } from "next/server";
import { COOKIE_PERFIL, PERFIS } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();
  const perfil = body.perfil;

  if (!PERFIS.includes(perfil)) {
    return NextResponse.json({ error: "Perfil inválido." }, { status: 400 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_PERFIL, perfil, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
