import { tokenAgenda } from "@/lib/auth";
import { listarCompromissos } from "@/lib/compromissos";
import { gerarICS } from "@/lib/ics";
import { hojeISO, somarDias } from "@/lib/agenda";

// Sempre gerado na hora: o calendário que assina esta URL precisa enxergar a
// agenda como ela está agora, não como estava no build.
export const dynamic = "force-dynamic";

// Esta rota fica fora da trava de login (ver src/middleware.js) porque quem a
// acessa é o servidor do Google/Apple, sem cookie. A proteção é o token na
// URL — quem tiver o link consegue LER a agenda, então ele deve ser tratado
// como uma senha.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const esperado = await tokenAgenda();

  if (!token || token !== esperado) {
    return new Response("Link de agenda inválido.", { status: 401 });
  }

  // Um calendário assinado não precisa carregar anos de histórico: 90 dias
  // para trás já cobrem consultas do passado recente sem inchar o arquivo.
  const compromissos = await listarCompromissos({ de: somarDias(hojeISO(), -90) });

  return new Response(gerarICS(compromissos), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="agenda-studio.ics"',
      "Cache-Control": "no-store",
    },
  });
}
