import Link from "next/link";
import { sql } from "@/lib/db";
import { DIAS_SEMANA, estiloDe, faixaDeHorario } from "@/components/agenda/estilos";

export const dynamic = "force-dynamic";

const formatarMoeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

const diaDaSemana = (dataISO) => {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return DIAS_SEMANA[new Date(ano, mes - 1, dia).getDay()];
};

async function buscarSemana() {
  // CURRENT_DATE no Supabase responde em UTC — das 21h em diante no Brasil
  // ele já virou o dia seguinte, e a semana sairia deslocada. Por isso a data
  // de referência é calculada explicitamente no fuso de Brasília.
  const [{ hoje, domingo, sabado }] = await sql`
    SELECT
      hoje,
      hoje - EXTRACT(DOW FROM hoje)::int AS domingo,
      hoje - EXTRACT(DOW FROM hoje)::int + 6 AS sabado
    FROM (SELECT (now() AT TIME ZONE 'America/Sao_Paulo')::date AS hoje) referencia
  `;

  const compromissos = await sql`
    SELECT
      compromissos.id,
      compromissos.titulo,
      compromissos.data,
      to_char(compromissos.hora_inicio, 'HH24:MI') AS hora_inicio,
      to_char(compromissos.hora_fim, 'HH24:MI') AS hora_fim,
      compromissos.dia_inteiro,
      compromissos.local,
      compromissos.cor,
      compromissos.concluido
    FROM compromissos
    WHERE compromissos.data BETWEEN ${domingo} AND ${sabado}
    ORDER BY
      compromissos.data ASC,
      compromissos.dia_inteiro DESC,
      compromissos.hora_inicio ASC NULLS FIRST,
      compromissos.id ASC
  `;

  // Agrupa por dia mantendo a ordem que veio do banco.
  const porDia = new Map();
  for (const compromisso of compromissos) {
    if (!porDia.has(compromisso.data)) porDia.set(compromisso.data, []);
    porDia.get(compromisso.data).push(compromisso);
  }

  return {
    hoje,
    domingo,
    sabado,
    total: compromissos.length,
    dias: [...porDia.entries()].map(([data, itens]) => ({ data, itens })),
  };
}

async function buscarResumo() {
  // As consultas não dependem umas das outras, então vão ao banco ao mesmo
  // tempo: a página espera só pela mais lenta, não pela soma de todas.
  const [
    [{ saldo }],
    [{ receitames: receitaMes }],
    [{ totalclientes: totalClientes }],
    [{ totalprojetosandamento: totalProjetosAndamento }],
    projetosProximos,
  ] = await Promise.all([
    sql`
      SELECT COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END), 0) AS saldo
      FROM transacoes
    `,
    sql`
      SELECT COALESCE(SUM(valor), 0) AS receitaMes
      FROM transacoes
      WHERE tipo = 'entrada' AND to_char(data, 'YYYY-MM') = to_char(CURRENT_DATE, 'YYYY-MM')
    `,
    sql`SELECT COUNT(*) AS totalClientes FROM clientes`,
    sql`SELECT COUNT(*) AS totalProjetosAndamento FROM projetos WHERE status != 'Finalizado'`,
    sql`
      SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome,
        projetos.prazo_entrega < CURRENT_DATE AS atrasado
      FROM projetos
      JOIN clientes ON clientes.id = projetos.cliente_id
      WHERE projetos.status != 'Finalizado' AND projetos.prazo_entrega IS NOT NULL
      ORDER BY projetos.prazo_entrega ASC
    `,
  ]);

  return {
    saldo,
    receitaMes,
    totalClientes: Number(totalClientes),
    totalProjetosAndamento: Number(totalProjetosAndamento),
    projetosPorMes: agruparPorMes(projetosProximos),
  };
}

function agruparPorMes(projetos) {
  const grupos = new Map();

  for (const projeto of projetos) {
    const chave = projeto.prazo_entrega.slice(0, 7);
    if (!grupos.has(chave)) grupos.set(chave, []);
    grupos.get(chave).push(projeto);
  }

  return [...grupos.entries()].map(([chave, itens]) => {
    const [ano, mes] = chave.split("-").map(Number);
    const rotulo = new Date(ano, mes - 1, 1).toLocaleDateString("pt-BR", {
      month: "long",
      year: "numeric",
    });
    return {
      chave,
      rotulo: rotulo.charAt(0).toUpperCase() + rotulo.slice(1),
      itens,
    };
  });
}

export default async function Home() {
  const [
    { saldo, receitaMes, totalClientes, totalProjetosAndamento, projetosPorMes },
    semana,
  ] = await Promise.all([
    buscarResumo(),
    // A tela de Início é a porta de entrada do sistema: se a tabela de
    // compromissos ainda não tiver sido criada no banco (o bloco da agenda em
    // supabase/schema.sql roda à mão), o certo é o card avisar — não a página
    // inteira quebrar.
    buscarSemana().catch(() => null),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8 sm:py-10">
      <h1 className="text-2xl font-semibold text-neutral-900">
        Bem-vindo(a) de volta
      </h1>
      <p className="mt-1 text-sm text-neutral-500">
        Aqui está o panorama do seu studio hoje.
      </p>

      {/* Resumo financeiro */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">Saldo atual</p>
          <p
            className={`mt-2 text-3xl font-semibold tracking-tight ${
              saldo >= 0 ? "text-neutral-900" : "text-red-600"
            }`}
          >
            {formatarMoeda(saldo)}
          </p>
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-neutral-500">
            Receita do mês
          </p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-emerald-600">
            {formatarMoeda(receitaMes)}
          </p>
        </div>
      </div>

      {/* Compromissos da semana */}
      <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-neutral-900">
            Compromissos da semana
          </h2>
          <div className="flex items-center gap-3">
            {semana && (
              <span className="text-xs text-neutral-400">
                {formatarData(semana.domingo)} a {formatarData(semana.sabado)}
              </span>
            )}
            <Link
              href="/agenda"
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900 hover:underline"
            >
              Ver agenda
            </Link>
          </div>
        </div>

        {!semana ? (
          <p className="mt-4 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            Não foi possível ler os compromissos. Se a agenda ainda não foi
            ativada neste banco, rode o bloco “compromissos” do arquivo
            supabase/schema.sql no SQL Editor do Supabase.
          </p>
        ) : semana.total === 0 ? (
          <p className="mt-4 rounded-lg bg-neutral-50 p-4 text-sm text-neutral-400">
            Nenhum compromisso marcado para esta semana.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-neutral-100">
            {semana.dias.map((dia) => (
              <div
                key={dia.data}
                className="flex flex-col gap-1.5 py-3 first:pt-0 last:pb-0 sm:flex-row sm:gap-4"
              >
                <div className="flex shrink-0 items-center gap-2 sm:w-32">
                  <span
                    className={`text-sm font-medium ${
                      dia.data === semana.hoje
                        ? "text-neutral-900"
                        : "text-neutral-500"
                    }`}
                  >
                    {diaDaSemana(dia.data)}, {dia.data.slice(8)}/{dia.data.slice(5, 7)}
                  </span>
                  {dia.data === semana.hoje && (
                    <span className="rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                      hoje
                    </span>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                  {dia.itens.map((compromisso) => (
                    <div key={compromisso.id} className="flex items-center gap-2">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                          estiloDe(compromisso.cor).ponto
                        }`}
                      />
                      <span className="w-24 shrink-0 text-xs tabular-nums text-neutral-500">
                        {faixaDeHorario(compromisso)}
                      </span>
                      <span
                        className={`min-w-0 truncate text-sm ${
                          compromisso.concluido
                            ? "text-neutral-400 line-through"
                            : "text-neutral-900"
                        }`}
                      >
                        {compromisso.titulo}
                        {compromisso.local && (
                          <span className="text-neutral-400">
                            {" "}
                            · {compromisso.local}
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Radar de entregas */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-neutral-900">
              Radar de entregas
            </h2>
            <span className="text-xs text-neutral-400">
              Agrupado por mês
            </span>
          </div>

          <div className="mt-4 space-y-5">
            {projetosPorMes.length === 0 && (
              <p className="rounded-lg bg-neutral-50 p-4 text-sm text-neutral-400">
                Nenhum projeto com prazo definido no momento.
              </p>
            )}

            {projetosPorMes.map((grupo) => (
              <div key={grupo.chave}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  {grupo.rotulo}
                </p>
                <div className="space-y-2">
                  {grupo.itens.map((projeto) => (
                    <div
                      key={projeto.id}
                      className={`flex items-center justify-between gap-4 rounded-lg border-l-4 p-4 ${
                        projeto.atrasado
                          ? "border-red-400 bg-red-50"
                          : "border-neutral-200 bg-neutral-50"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-neutral-900">
                          {projeto.nome}
                        </p>
                        <p className="text-xs text-neutral-500">
                          {projeto.cliente_nome} · {formatarData(projeto.prazo_entrega)}
                        </p>
                      </div>
                      {projeto.atrasado ? (
                        <span className="shrink-0 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
                          Atrasado
                        </span>
                      ) : (
                        <span className="shrink-0 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-500">
                          {projeto.status}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métricas rápidas */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-1">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm font-medium text-neutral-500">
              Clientes cadastrados
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {totalClientes}
            </p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <p className="text-sm font-medium text-neutral-500">
              Projetos em andamento
            </p>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-neutral-900">
              {totalProjetosAndamento}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
