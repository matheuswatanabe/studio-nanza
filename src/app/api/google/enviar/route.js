import { NextResponse } from "next/server";
import { enviarPendentes } from "@/lib/google";

// Envia para o Google um lote de compromissos pendentes: os que já existiam
// antes da conexão e os que falharam em algum salvamento. A tela chama de
// novo enquanto `restantes` for maior que zero.
export async function POST() {
  const resultado = await enviarPendentes();
  return NextResponse.json(resultado);
}
