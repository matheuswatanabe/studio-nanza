import { NextResponse } from "next/server";
import { COOKIE_NAME, COOKIE_PERFIL } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete(COOKIE_NAME);
  response.cookies.delete(COOKIE_PERFIL);
  return response;
}
