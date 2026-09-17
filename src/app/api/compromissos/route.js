import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { perfilAtual } from "@/lib/perfil";
import {
  listarCompromissos,
  projetoExiste,
  validarCompromisso,
} from "@/lib/compromissos";

export async function GET() {
  const compromissos = await listarCompromissos();
  return NextResponse.json(compromissos);
}

export async function POST(request) {
  const body = await request.json();
  const { erro, valores } = validarCompromisso(body);

  if (erro) {
    return NextResponse.json({ error: erro }, { status: 400 });
  }

  if (!(await projetoExiste(valores.projetoId))) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 400 });
  }

  const criadoPor = await perfilAtual();

  const [criado] = await sql`
    INSERT INTO compromissos
      (titulo, descricao, data, hora_inicio, hora_fim, dia_inteiro, local, cor,
       projeto_id, concluido, criado_por)
    VALUES (
      ${valores.titulo}, ${valores.descricao}, ${valores.data},
      ${valores.horaInicio}, ${valores.horaFim}, ${valores.diaInteiro},
      ${valores.local}, ${valores.cor}, ${valores.projetoId},
      ${valores.concluido}, ${criadoPor}
    )
    RETURNING id
  `;

  const [compromisso] = await listarCompromissos({ id: criado.id });

  return NextResponse.json(compromisso, { status: 201 });
}
