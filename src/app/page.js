import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

const formatarMoeda = (valor) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function formatarData(dataISO) {
  const [ano, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}/${ano}`;
}

async function buscarResumo() {
  const [{ saldo }] = await sql`
    SELECT COALESCE(SUM(CASE WHEN tipo = 'entrada' THEN valor ELSE -valor END), 0) AS saldo
    FROM transacoes
  `;

  const [{ receitames: receitaMes }] = await sql`
    SELECT COALESCE(SUM(valor), 0) AS receitaMes
    FROM transacoes
    WHERE tipo = 'entrada' AND to_char(data, 'YYYY-MM') = to_char(CURRENT_DATE, 'YYYY-MM')
  `;

  const [{ totalclientes: totalClientes }] = await sql`
    SELECT COUNT(*) AS totalClientes FROM clientes
  `;

  const [{ totalprojetosandamento: totalProjetosAndamento }] = await sql`
    SELECT COUNT(*) AS totalProjetosAndamento FROM projetos WHERE status != 'Finalizado'
  `;

  const projetosProximos = await sql`
    SELECT projetos.*, COALESCE(clientes.empresa, clientes.nome) AS cliente_nome,
      projetos.prazo_entrega < CURRENT_DATE AS atrasado
    FROM projetos
    JOIN clientes ON clientes.id = projetos.cliente_id
    WHERE projetos.status != 'Finalizado' AND projetos.prazo_entrega IS NOT NULL
    ORDER BY projetos.prazo_entrega ASC
  `;

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
  const {
    saldo,
    receitaMes,
    totalClientes,
    totalProjetosAndamento,
    projetosPorMes,
  } = await buscarResumo();

  return (
    <div className="mx-auto max-w-5xl px-8 py-10">
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
