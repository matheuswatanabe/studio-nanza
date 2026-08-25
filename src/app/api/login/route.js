import { NextResponse } from "next/server";
import { COOKIE_NAME, tokenEsperado } from "@/lib/auth";

export async function POST(request) {
  if (!process.env.APP_PASSWORD) {
    return NextResponse.json(
      {
        error:
          "A senha do sistema não está configurada. Defina APP_PASSWORD nas variáveis de ambiente.",
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const senha = body.senha ?? "";

  if (senha !== process.env.APP_PASSWORD) {
    return NextResponse.json({ error: "Senha incorreta." }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, await tokenEsperado(), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return response;
}
