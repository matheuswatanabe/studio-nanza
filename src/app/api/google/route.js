import { NextResponse } from "next/server";
import { desconectar, statusDaIntegracao } from "@/lib/google";
import { origemDe } from "@/lib/origem";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const status = await statusDaIntegracao({ origem: origemDe(request.headers) });
  return NextResponse.json(status);
}

export async function DELETE() {
  await desconectar();
  return NextResponse.json({ ok: true });
}
