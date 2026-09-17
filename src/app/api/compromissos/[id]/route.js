import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import {
  listarCompromissos,
  projetoExiste,
  validarCompromisso,
} from "@/lib/compromissos";
import { ehDataISO } from "@/lib/agenda";

async function buscarExistente(id) {
  const [existente] = await sql`SELECT id FROM compromissos WHERE id = ${id}`;
  return existente ?? null;
}

export async function PUT(request, { params }) {
  const id = Number(params.id);

  if (!(await buscarExistente(id))) {
    return NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const { erro, valores } = validarCompromisso(body);

  if (erro) {
    return NextResponse.json({ error: erro }, { status: 400 });
  }

  if (!(await projetoExiste(valores.projetoId))) {
    return NextResponse.json({ error: "Projeto não encontrado." }, { status: 400 });
  }

  await sql`
    UPDATE compromissos
    SET titulo = ${valores.titulo},
        descricao = ${valores.descricao},
        data = ${valores.data},
        hora_inicio = ${valores.horaInicio},
        hora_fim = ${valores.horaFim},
        dia_inteiro = ${valores.diaInteiro},
        local = ${valores.local},
        cor = ${valores.cor},
        projeto_id = ${valores.projetoId},
        concluido = ${valores.concluido},
        atualizado_em = now()
    WHERE id = ${id}
  `;

  const [compromisso] = await listarCompromissos({ id });

  return NextResponse.json(compromisso);
}

// Usado pelos dois gestos rápidos da página: arrastar um compromisso para
// outro dia (muda só a data) e marcar/desmarcar como concluído. Mandar o
// formulário inteiro num PUT nesses casos só criaria chance de sobrescrever
// campos sem querer.
export async function PATCH(request, { params }) {
  const id = Number(params.id);

  if (!(await buscarExistente(id))) {
    return NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 });
  }

  const body = await request.json();
  const mudancas = {};

  if (body.data !== undefined) {
    if (!ehDataISO(body.data)) {
      return NextResponse.json({ error: "Data inválida." }, { status: 400 });
    }
    mudancas.data = body.data;
  }

  if (body.concluido !== undefined) {
    mudancas.concluido = Boolean(body.concluido);
  }

  if (Object.keys(mudancas).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar." }, { status: 400 });
  }

  await sql`
    UPDATE compromissos
    SET ${sql(mudancas, ...Object.keys(mudancas))}, atualizado_em = now()
    WHERE id = ${id}
  `;

  const [compromisso] = await listarCompromissos({ id });

  return NextResponse.json(compromisso);
}

export async function DELETE(request, { params }) {
  const id = Number(params.id);

  if (!(await buscarExistente(id))) {
    return NextResponse.json({ error: "Compromisso não encontrado." }, { status: 404 });
  }

  await sql`DELETE FROM compromissos WHERE id = ${id}`;

  return NextResponse.json({ ok: true });
}
