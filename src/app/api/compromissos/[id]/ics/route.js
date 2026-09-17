import { NextResponse } from "next/server";
import { listarCompromissos } from "@/lib/compromissos";
import { gerarICS } from "@/lib/ics";

// Download de um compromisso avulso. No celular, abrir esse arquivo joga o
// evento direto no calendário do aparelho (Google, Apple ou qualquer outro),
// sem precisar assinar a agenda inteira.
export async function GET(request, { params }) {
  const id = Number(params.id);
  const [compromisso] = await listarCompromissos({ id });

  if (!compromisso) {
    return NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 });
  }

  // O nome do arquivo vai em duas versões: uma sem acento, para navegadores
  // antigos, e a real em UTF-8 (RFC 5987), que é a que os atuais usam.
  const base =
    compromisso.titulo
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
      .slice(0, 40)
      .toLowerCase() || "compromisso";

  return new Response(gerarICS([compromisso], { nome: compromisso.titulo }), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition":
        `attachment; filename="${base}.ics"; ` +
        `filename*=UTF-8''${encodeURIComponent(compromisso.titulo)}.ics`,
      "Cache-Control": "no-store",
    },
  });
}
