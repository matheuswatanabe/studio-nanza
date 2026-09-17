"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { formatarData, hojeISO } from "@/lib/agenda";
import ModalCompromisso from "@/components/agenda/ModalCompromisso";
import PainelSincronizacao from "@/components/agenda/PainelSincronizacao";
import {
  DIAS_SEMANA,
  estiloDe,
  faixaDeHorario,
  gradeDoMes,
  rotuloDia,
  rotuloMes,
} from "@/components/agenda/estilos";

const FORM_INICIAL = {
  titulo: "",
  descricao: "",
  data: "",
  hora_inicio: "",
  hora_fim: "",
  dia_inteiro: false,
  local: "",
  cor: "azul",
  projeto_id: "",
};

function formDoCompromisso(compromisso) {
  return {
    titulo: compromisso.titulo,
    descricao: compromisso.descricao ?? "",
    data: compromisso.data,
    hora_inicio: compromisso.hora_inicio ?? "",
    hora_fim: compromisso.hora_fim ?? "",
    dia_inteiro: compromisso.dia_inteiro,
    local: compromisso.local ?? "",
    cor: compromisso.cor,
    projeto_id: compromisso.projeto_id ? String(compromisso.projeto_id) : "",
  };
}

/* ------------------------------------------------------------------ */

function Chip({ compromisso, onAbrir, onArrastar, onFimArrasto, arrastando }) {
  const estilo = estiloDe(compromisso.cor);

  return (
    <button
      type="button"
      draggable
      onDragStart={(e) => onArrastar(e, compromisso)}
      onDragEnd={onFimArrasto}
      onClick={(e) => {
        e.stopPropagation();
        onAbrir(compromisso);
      }}
      title={`${faixaDeHorario(compromisso)} · ${compromisso.titulo}`}
      className={`flex w-full cursor-grab items-center gap-1.5 rounded-md px-1.5 py-1 text-left text-[11px] leading-tight ring-1 transition active:cursor-grabbing ${
        estilo.chip
      } ${arrastando ? "opacity-40" : ""} ${
        compromisso.concluido ? "line-through opacity-60" : ""
      }`}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${estilo.ponto}`} />
      {!compromisso.dia_inteiro && compromisso.hora_inicio && (
        <span className="shrink-0 font-medium tabular-nums">
          {compromisso.hora_inicio}
        </span>
      )}
      <span className="truncate">{compromisso.titulo}</span>
    </button>
  );
}

function ChipPrazo({ prazo }) {
  return (
    <Link
      href="/projetos"
      onClick={(e) => e.stopPropagation()}
      title={`Entrega do projeto ${prazo.titulo}${
        prazo.cliente_nome ? ` — ${prazo.cliente_nome}` : ""
      }`}
      className="flex w-full items-center gap-1.5 rounded-md border border-dashed border-neutral-300 px-1.5 py-1 text-left text-[11px] leading-tight text-neutral-500 transition hover:border-neutral-400 hover:text-neutral-700"
    >
      <span className="shrink-0">◇</span>
      <span className="truncate">{prazo.titulo}</span>
    </Link>
  );
}

/* ------------------------------------------------------------------ */

export default function Agenda({ urlFeed }) {
  const hoje = hojeISO();

  const [compromissos, setCompromissos] = useState([]);
  const [projetos, setProjetos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erroGeral, setErroGeral] = useState("");

  const [ano, setAno] = useState(() => Number(hoje.slice(0, 4)));
  const [mes, setMes] = useState(() => Number(hoje.slice(5, 7)));
  const [visao, setVisao] = useState("mes");
  const [diaSelecionado, setDiaSelecionado] = useState(hoje);

  const [busca, setBusca] = useState("");
  const [mostrarConcluidos, setMostrarConcluidos] = useState(true);
  const [mostrarPrazos, setMostrarPrazos] = useState(true);

  const [modal, setModal] = useState(null); // { modo, compromisso }
  const [form, setForm] = useState(FORM_INICIAL);
  const [salvando, setSalvando] = useState(false);
  const [excluindo, setExcluindo] = useState(false);
  const [erroForm, setErroForm] = useState("");

  const [arrastandoId, setArrastandoId] = useState(null);
  const [diaAlvo, setDiaAlvo] = useState(null);

  const [aviso, setAviso] = useState("");
  const avisoTimer = useRef(null);

  function mostrarAviso(texto) {
    setAviso(texto);
    clearTimeout(avisoTimer.current);
    avisoTimer.current = setTimeout(() => setAviso(""), 3500);
  }

  useEffect(() => () => clearTimeout(avisoTimer.current), []);

  async function carregarDados() {
    setCarregando(true);
    try {
      const [resCompromissos, resProjetos] = await Promise.all([
        fetch("/api/compromissos"),
        fetch("/api/projetos"),
      ]);

      if (!resCompromissos.ok) {
        const dados = await resCompromissos.json().catch(() => ({}));
        throw new Error(dados.error ?? "Não foi possível carregar a agenda.");
      }

      setCompromissos(await resCompromissos.json());
      setProjetos(resProjetos.ok ? await resProjetos.json() : []);
      setErroGeral("");
    } catch (e) {
      setErroGeral(
        `${e.message} Se esta é a primeira vez que você abre a agenda, rode o bloco "compromissos" do arquivo supabase/schema.sql no SQL Editor do Supabase.`
      );
    }
    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  /* --- navegação -------------------------------------------------- */

  function irParaMes(delta) {
    const referencia = new Date(ano, mes - 1 + delta, 1);
    setAno(referencia.getFullYear());
    setMes(referencia.getMonth() + 1);
  }

  function irParaHoje() {
    setAno(Number(hoje.slice(0, 4)));
    setMes(Number(hoje.slice(5, 7)));
    setDiaSelecionado(hoje);
  }

  // Setas do teclado trocam de mês e Esc fecha o que estiver aberto. Só vale
  // quando o foco não está num campo de texto — senão atrapalharia a digitação.
  useEffect(() => {
    function aoTeclar(e) {
      if (e.key === "Escape") {
        if (modal) fecharModal();
        return;
      }

      if (modal) return;

      const alvo = e.target;
      const digitando =
        alvo instanceof HTMLElement &&
        (["INPUT", "TEXTAREA", "SELECT"].includes(alvo.tagName) ||
          alvo.isContentEditable);
      if (digitando || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "ArrowLeft") irParaMes(-1);
      if (e.key === "ArrowRight") irParaMes(1);
      if (e.key.toLowerCase() === "t") irParaHoje();
    }

    document.addEventListener("keydown", aoTeclar);
    return () => document.removeEventListener("keydown", aoTeclar);
  });

  /* --- dados derivados -------------------------------------------- */

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return compromissos.filter((c) => {
      if (!mostrarConcluidos && c.concluido) return false;
      if (!termo) return true;
      return [c.titulo, c.descricao, c.local, c.projeto_nome]
        .filter(Boolean)
        .some((campo) => campo.toLowerCase().includes(termo));
    });
  }, [compromissos, busca, mostrarConcluidos]);

  // Prazos de entrega dos projetos em andamento entram como uma camada de
  // leitura: não são editáveis aqui, mas evitam marcar uma reunião em cima
  // de uma entrega sem perceber.
  const prazos = useMemo(() => {
    if (!mostrarPrazos) return [];
    const termo = busca.trim().toLowerCase();
    return projetos
      .filter((p) => p.prazo_entrega && p.status !== "Finalizado")
      .map((p) => ({
        id: `prazo-${p.id}`,
        data: p.prazo_entrega,
        titulo: `Entrega: ${p.nome}`,
        cliente_nome: p.cliente_nome,
      }))
      .filter((p) => !termo || p.titulo.toLowerCase().includes(termo));
  }, [projetos, mostrarPrazos, busca]);

  const porDia = useMemo(() => {
    const mapa = new Map();
    for (const c of visiveis) {
      if (!mapa.has(c.data)) mapa.set(c.data, { compromissos: [], prazos: [] });
      mapa.get(c.data).compromissos.push(c);
    }
    for (const p of prazos) {
      if (!mapa.has(p.data)) mapa.set(p.data, { compromissos: [], prazos: [] });
      mapa.get(p.data).prazos.push(p);
    }
    return mapa;
  }, [visiveis, prazos]);

  const doDia = (iso) => porDia.get(iso) ?? { compromissos: [], prazos: [] };

  const semanas = useMemo(() => gradeDoMes(ano, mes), [ano, mes]);

  const diasDoMesComItens = useMemo(() => {
    const prefixo = `${ano}-${String(mes).padStart(2, "0")}`;
    return [...porDia.entries()]
      .filter(([iso]) => iso.startsWith(prefixo))
      .sort(([a], [b]) => a.localeCompare(b));
  }, [porDia, ano, mes]);

  const totalDoMes = diasDoMesComItens.reduce(
    (soma, [, itens]) => soma + itens.compromissos.length,
    0
  );

  /* --- criar / editar --------------------------------------------- */

  function abrirNovo(data) {
    setForm({ ...FORM_INICIAL, data: data ?? diaSelecionado ?? hoje });
    setErroForm("");
    setModal({ modo: "criar", compromisso: null });
  }

  function abrirEdicao(compromisso) {
    setForm(formDoCompromisso(compromisso));
    setErroForm("");
    setModal({ modo: "editar", compromisso });
  }

  function fecharModal() {
    setModal(null);
    setErroForm("");
  }

  async function salvar() {
    setErroForm("");
    setSalvando(true);

    const criando = modal.modo === "criar";
    const res = await fetch(
      criando ? "/api/compromissos" : `/api/compromissos/${modal.compromisso.id}`,
      {
        method: criando ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Num compromisso já concluído, editar os dados não deve
          // "desmarcá-lo" — o estado de concluído tem botão próprio.
          concluido: criando ? false : modal.compromisso.concluido,
        }),
      }
    );

    setSalvando(false);

    if (!res.ok) {
      const dados = await res.json().catch(() => ({}));
      setErroForm(dados.error ?? "Não foi possível salvar o compromisso.");
      return;
    }

    const salvo = await res.json();
    setCompromissos((atuais) =>
      criando
        ? [...atuais, salvo]
        : atuais.map((c) => (c.id === salvo.id ? salvo : c))
    );
    setDiaSelecionado(salvo.data);
    fecharModal();
    mostrarAviso(
      criando
        ? `Compromisso criado em ${formatarData(salvo.data)}.`
        : "Compromisso atualizado."
    );
  }

  async function excluir() {
    const { id, titulo } = modal.compromisso;
    if (!window.confirm(`Excluir “${titulo}”? Essa ação não pode ser desfeita.`))
      return;

    setExcluindo(true);
    const res = await fetch(`/api/compromissos/${id}`, { method: "DELETE" });
    setExcluindo(false);

    if (!res.ok) {
      const dados = await res.json().catch(() => ({}));
      setErroForm(dados.error ?? "Não foi possível excluir o compromisso.");
      return;
    }

    setCompromissos((atuais) => atuais.filter((c) => c.id !== id));
    fecharModal();
    mostrarAviso("Compromisso excluído.");
  }

  /* --- gestos rápidos (otimistas) --------------------------------- */

  // Marca/desmarca na hora e só depois confirma no servidor: esperar a ida e
  // volta da rede para um clique de checkbox deixa a lista travada.
  async function alternarConcluido(compromisso) {
    const desejado = !compromisso.concluido;
    setCompromissos((atuais) =>
      atuais.map((c) => (c.id === compromisso.id ? { ...c, concluido: desejado } : c))
    );

    const res = await fetch(`/api/compromissos/${compromisso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ concluido: desejado }),
    });

    if (!res.ok) {
      setCompromissos((atuais) =>
        atuais.map((c) =>
          c.id === compromisso.id ? { ...c, concluido: !desejado } : c
        )
      );
      mostrarAviso("Não foi possível atualizar o compromisso.");
    }
  }

  async function moverPara(compromisso, novaData) {
    if (!novaData || novaData === compromisso.data) return;
    const dataAnterior = compromisso.data;

    setCompromissos((atuais) =>
      atuais.map((c) => (c.id === compromisso.id ? { ...c, data: novaData } : c))
    );
    setDiaSelecionado(novaData);

    const res = await fetch(`/api/compromissos/${compromisso.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: novaData }),
    });

    if (!res.ok) {
      setCompromissos((atuais) =>
        atuais.map((c) =>
          c.id === compromisso.id ? { ...c, data: dataAnterior } : c
        )
      );
      mostrarAviso("Não foi possível mover o compromisso.");
      return;
    }

    mostrarAviso(`“${compromisso.titulo}” movido para ${formatarData(novaData)}.`);
  }

  function iniciarArrasto(e, compromisso) {
    e.dataTransfer.setData("text/plain", String(compromisso.id));
    e.dataTransfer.effectAllowed = "move";
    setArrastandoId(compromisso.id);
  }

  function encerrarArrasto() {
    setArrastandoId(null);
    setDiaAlvo(null);
  }

  function soltarNoDia(e, iso) {
    e.preventDefault();
    setDiaAlvo(null);
    const id = Number(e.dataTransfer.getData("text/plain"));
    const compromisso = compromissos.find((c) => c.id === id);
    setArrastandoId(null);
    if (compromisso) moverPara(compromisso, iso);
  }

  /* --- interface --------------------------------------------------- */

  const itensDoDiaSelecionado = doDia(diaSelecionado);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Agenda</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Os compromissos do studio, dia a dia — e no celular de quem precisa.
          </p>
        </div>
        <button
          type="button"
          onClick={() => abrirNovo()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white"
        >
          Novo compromisso
        </button>
      </div>

      {erroGeral && (
        <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {erroGeral}
        </p>
      )}

      {/* Barra de navegação e filtros */}
      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-white p-4 lg:flex-row lg:items-center">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => irParaMes(-1)}
            aria-label="Mês anterior"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
          >
            ‹
          </button>
          <span className="min-w-[10rem] text-center text-sm font-semibold text-neutral-900">
            {rotuloMes(ano, mes)}
          </span>
          <button
            type="button"
            onClick={() => irParaMes(1)}
            aria-label="Próximo mês"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
          >
            ›
          </button>
          <button
            type="button"
            onClick={irParaHoje}
            className="ml-1 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-50"
          >
            Hoje
          </button>
        </div>

        <div className="flex rounded-lg border border-neutral-300 p-0.5">
          {[
            { valor: "mes", rotulo: "Mês" },
            { valor: "lista", rotulo: "Lista" },
          ].map((opcao) => (
            <button
              key={opcao.valor}
              type="button"
              onClick={() => setVisao(opcao.valor)}
              aria-pressed={visao === opcao.valor}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                visao === opcao.valor
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              {opcao.rotulo}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Buscar por título, local ou projeto"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="min-w-0 flex-1 rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-neutral-900"
        />

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={mostrarConcluidos}
              onChange={(e) => setMostrarConcluidos(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
            />
            Concluídos
          </label>
          <label className="flex items-center gap-2 text-xs text-neutral-600">
            <input
              type="checkbox"
              checked={mostrarPrazos}
              onChange={(e) => setMostrarPrazos(e.target.checked)}
              className="h-4 w-4 rounded border-neutral-300 accent-neutral-900"
            />
            Prazos de projetos
          </label>
        </div>
      </div>

      {aviso && (
        <p
          role="status"
          className="mt-3 rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white"
        >
          {aviso}
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
        {/* Calendário / lista */}
        <div className="min-w-0 rounded-xl border border-neutral-200 bg-white p-3 sm:p-4">
          {carregando ? (
            <p className="px-2 py-16 text-center text-sm text-neutral-400">
              Carregando a agenda...
            </p>
          ) : visao === "mes" ? (
            <>
              <div className="grid grid-cols-7 gap-1 pb-2">
                {DIAS_SEMANA.map((dia) => (
                  <span
                    key={dia}
                    className="px-1 text-center text-[11px] font-medium uppercase tracking-wide text-neutral-400"
                  >
                    {dia}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {semanas.flat().map((dia) => {
                  const itens = doDia(dia.iso);
                  const total = itens.compromissos.length + itens.prazos.length;
                  const visiveisNoDia = itens.compromissos.slice(0, 3);
                  const restantes = total - visiveisNoDia.length;
                  const ehHoje = dia.iso === hoje;
                  const selecionado = dia.iso === diaSelecionado;

                  return (
                    <div
                      key={dia.iso}
                      onClick={() => setDiaSelecionado(dia.iso)}
                      onDoubleClick={() => abrirNovo(dia.iso)}
                      onDragOver={(e) => {
                        if (arrastandoId === null) return;
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                        setDiaAlvo(dia.iso);
                      }}
                      onDragLeave={() =>
                        setDiaAlvo((atual) => (atual === dia.iso ? null : atual))
                      }
                      onDrop={(e) => soltarNoDia(e, dia.iso)}
                      className={`flex min-h-[5.5rem] cursor-pointer flex-col gap-1 rounded-lg border p-1.5 transition sm:min-h-[7rem] ${
                        dia.doMes ? "bg-white" : "bg-neutral-50/60"
                      } ${
                        diaAlvo === dia.iso
                          ? "border-neutral-900 ring-2 ring-neutral-900/10"
                          : selecionado
                            ? "border-neutral-900"
                            : "border-neutral-200 hover:border-neutral-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs font-medium ${
                            ehHoje
                              ? "bg-neutral-900 text-white"
                              : dia.doMes
                                ? "text-neutral-700"
                                : "text-neutral-300"
                          }`}
                        >
                          {dia.numero}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            abrirNovo(dia.iso);
                          }}
                          aria-label={`Novo compromisso em ${formatarData(dia.iso)}`}
                          className="flex h-5 w-5 items-center justify-center rounded text-sm text-neutral-300 transition hover:bg-neutral-100 hover:text-neutral-700"
                        >
                          +
                        </button>
                      </div>

                      <div className="flex flex-col gap-1">
                        {visiveisNoDia.map((c) => (
                          <Chip
                            key={c.id}
                            compromisso={c}
                            onAbrir={abrirEdicao}
                            onArrastar={iniciarArrasto}
                            onFimArrasto={encerrarArrasto}
                            arrastando={arrastandoId === c.id}
                          />
                        ))}
                        {visiveisNoDia.length === itens.compromissos.length &&
                          itens.prazos
                            .slice(0, 3 - visiveisNoDia.length)
                            .map((p) => <ChipPrazo key={p.id} prazo={p} />)}
                        {restantes > 0 && (
                          <span className="px-1 text-[11px] font-medium text-neutral-400">
                            +{restantes} no dia
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className="mt-3 px-1 text-[11px] text-neutral-400">
                Clique num dia para ver os detalhes ao lado, dois cliques para
                criar. Arraste um compromisso para outro dia para remarcá-lo. As
                setas ← → trocam de mês e a tecla T volta para hoje.
              </p>
            </>
          ) : (
            <div className="divide-y divide-neutral-100">
              {diasDoMesComItens.length === 0 ? (
                <p className="px-2 py-16 text-center text-sm text-neutral-400">
                  Nenhum compromisso em {rotuloMes(ano, mes).toLowerCase()}.
                </p>
              ) : (
                diasDoMesComItens.map(([iso, itens]) => (
                  <div key={iso} className="flex flex-col gap-2 py-4 sm:flex-row sm:gap-5">
                    <button
                      type="button"
                      onClick={() => {
                        setDiaSelecionado(iso);
                        setVisao("mes");
                      }}
                      className="w-full shrink-0 text-left sm:w-44"
                    >
                      <span
                        className={`text-sm font-medium ${
                          iso === hoje ? "text-neutral-900" : "text-neutral-600"
                        }`}
                      >
                        {rotuloDia(iso)}
                      </span>
                      {iso === hoje && (
                        <span className="ml-2 rounded bg-neutral-900 px-1.5 py-0.5 text-[10px] font-medium text-white">
                          hoje
                        </span>
                      )}
                    </button>

                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      {itens.compromissos.map((c) => {
                        const estilo = estiloDe(c.cor);
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => abrirEdicao(c)}
                            className="flex items-start gap-3 rounded-lg border border-neutral-200 p-3 text-left transition hover:border-neutral-300"
                          >
                            <span
                              className={`mt-0.5 h-8 w-1 shrink-0 rounded-full ${estilo.solido}`}
                            />
                            <span className="min-w-0 flex-1">
                              <span
                                className={`block text-sm font-medium text-neutral-900 ${
                                  c.concluido ? "line-through text-neutral-400" : ""
                                }`}
                              >
                                {c.titulo}
                              </span>
                              <span className="mt-0.5 block text-xs text-neutral-500">
                                {faixaDeHorario(c)}
                                {c.local ? ` · ${c.local}` : ""}
                                {c.projeto_nome ? ` · ${c.projeto_nome}` : ""}
                              </span>
                              {c.descricao && (
                                <span className="mt-1 block whitespace-pre-line text-xs text-neutral-500">
                                  {c.descricao}
                                </span>
                              )}
                            </span>
                          </button>
                        );
                      })}
                      {itens.prazos.map((p) => (
                        <ChipPrazo key={p.id} prazo={p} />
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Painel do dia selecionado */}
        <aside className="rounded-xl border border-neutral-200 bg-white p-4 lg:sticky lg:top-6 lg:self-start">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            {diaSelecionado === hoje ? "Hoje" : "Dia selecionado"}
          </p>
          <h2 className="mt-1 text-sm font-semibold text-neutral-900">
            {rotuloDia(diaSelecionado)}
          </h2>

          <button
            type="button"
            onClick={() => abrirNovo(diaSelecionado)}
            className="mt-3 w-full rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-sm font-medium text-neutral-600 transition hover:border-neutral-400 hover:bg-neutral-50"
          >
            + Adicionar neste dia
          </button>

          <div className="mt-4 flex flex-col gap-2">
            {itensDoDiaSelecionado.compromissos.length === 0 &&
              itensDoDiaSelecionado.prazos.length === 0 && (
                <p className="py-6 text-center text-xs text-neutral-400">
                  Nenhum compromisso neste dia.
                </p>
              )}

            {itensDoDiaSelecionado.compromissos.map((c) => {
              const estilo = estiloDe(c.cor);
              return (
                <div
                  key={c.id}
                  className="flex items-start gap-2 rounded-lg border border-neutral-200 p-2.5"
                >
                  <input
                    type="checkbox"
                    checked={c.concluido}
                    onChange={() => alternarConcluido(c)}
                    aria-label={`Marcar “${c.titulo}” como concluído`}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 accent-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => abrirEdicao(c)}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      <span
                        className={`h-1.5 w-1.5 shrink-0 rounded-full ${estilo.ponto}`}
                      />
                      <span
                        className={`truncate text-sm font-medium ${
                          c.concluido
                            ? "text-neutral-400 line-through"
                            : "text-neutral-900"
                        }`}
                      >
                        {c.titulo}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-neutral-500">
                      {faixaDeHorario(c)}
                      {c.local ? ` · ${c.local}` : ""}
                    </span>
                    {c.descricao && (
                      <span className="mt-1 block whitespace-pre-line text-xs text-neutral-500">
                        {c.descricao}
                      </span>
                    )}
                    {c.projeto_nome && (
                      <span className="mt-1 inline-block rounded bg-neutral-100 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600">
                        {c.projeto_nome}
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            {itensDoDiaSelecionado.prazos.map((p) => (
              <ChipPrazo key={p.id} prazo={p} />
            ))}
          </div>

          <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-400">
            {totalDoMes} compromisso{totalDoMes === 1 ? "" : "s"} em{" "}
            {rotuloMes(ano, mes).toLowerCase()}.
          </p>
        </aside>
      </div>

      <PainelSincronizacao urlFeed={urlFeed} />

      {modal && (
        <ModalCompromisso
          modo={modal.modo}
          form={form}
          setForm={setForm}
          projetos={projetos}
          compromisso={modal.compromisso}
          salvando={salvando}
          excluindo={excluindo}
          erro={erroForm}
          onSalvar={salvar}
          onExcluir={excluir}
          onFechar={fecharModal}
        />
      )}
    </div>
  );
}
