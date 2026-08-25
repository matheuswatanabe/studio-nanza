import { NextResponse } from "next/server";
import { sql } from "@/lib/db";

export async function DELETE(request, { params }) {
  const id = Number(params.assetId);
  const [existente] = await sql`SELECT id FROM marca_assets WHERE id = ${id}`;

  if (!existente) {
    return NextResponse.json(
      { error: "Ativo não encontrado." },
      { status: 404 }
    );
  }

  await sql`DELETE FROM marca_assets WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
