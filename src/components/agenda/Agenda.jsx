"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatarData, hojeISO } from "@/lib/agenda";
import GradeMes from "@/components/agenda/GradeMes";
import ModalCompromisso from "@/components/agenda/ModalCompromisso";
import PainelDia from "@/components/agenda/PainelDia";
import PainelSincronizacao from "@/components/agenda/PainelSincronizacao";
import VisaoLista from "@/components/agenda/VisaoLista";
import { gradeDoMes, rotuloMes } from "@/components/agenda/estilos";

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

export default function Agenda({ urlFeed, retornoGoogle, dadosIniciais }) {
  const hoje = hojeISO();

  const [compromissos, setCompromissos] = useState(dadosIniciais.compromissos);
  const [projetos, setProjetos] = useState(dadosIniciais.projetos);
  const [carregando, setCarregando] = useState(false);
  const [erroGeral, setErroGeral] = useState(dadosIniciais.erro);
  const [google, setGoogle] = useState(dadosIniciais.google);

  // Só faz sentido marcar algo como "não sincronizado" se existe uma conta
  // Google conectada funcionando.
  const googleAtivo = Boolean(google?.conectado && !google.erro);
  const naoSincronizado = (c) => googleAtivo && (c.google_erro || !c.google_event_id);

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
    // Avisos longos (erros do Google) ficam mais tempo, para dar para ler.
    avisoTimer.current = setTimeout(() => setAviso(""), texto.length > 80 ? 8000 : 3500);
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

  // O status do Google é carregado à parte: se a consulta falhar (tabela da
  // integração ainda não criada, por exemplo), a agenda continua funcionando.
  async function carregarStatusGoogle() {
    try {
      const res = await fetch("/api/google");
      setGoogle(res.ok ? await res.json() : { configurado: false, conectado: false, uriDeRetorno: "" });
    } catch {
      setGoogle({ configurado: false, conectado: false, uriDeRetorno: "" });
    }
  }

  function recarregarTudo() {
    carregarDados();
    carregarStatusGoogle();
  }

  useEffect(() => {
    // Tira o ?google=... da barra de endereço depois de ler, para um F5 não
    // repetir o aviso nem o envio automático.
    if (retornoGoogle) window.history.replaceState(null, "", "/agenda");
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

    const base = criando
      ? `Compromisso criado em ${formatarData(salvo.data)}`
      : "Compromisso atualizado";
    mostrarAviso(
      !googleAtivo
        ? `${base}.`
        : salvo.google_erro
          ? `${base} no site, mas não foi para o Google Agenda: ${salvo.google_erro}`
          : `${base} e enviado ao Google Agenda.`
    );
    if (googleAtivo) carregarStatusGoogle();
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

    const { aviso: avisoGoogle } = await res.json().catch(() => ({}));
    setCompromissos((atuais) => atuais.filter((c) => c.id !== id));
    fecharModal();
    mostrarAviso(avisoGoogle ?? "Compromisso excluído.");
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
      return;
    }

    // A resposta traz o estado da sincronização com o Google atualizado.
    substituirPelaVersaoDoServidor(await res.json());
  }

  function substituirPelaVersaoDoServidor(atualizado) {
    setCompromissos((atuais) =>
      atuais.map((c) => (c.id === atualizado.id ? atualizado : c))
    );
    if (googleAtivo && atualizado.google_erro) {
      mostrarAviso(`Salvo no site, mas não foi para o Google Agenda: ${atualizado.google_erro}`);
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
    substituirPelaVersaoDoServidor(await res.json());
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
            <GradeMes
              semanas={semanas}
              doDia={doDia}
              hoje={hoje}
              diaSelecionado={diaSelecionado}
              setDiaSelecionado={setDiaSelecionado}
              diaAlvo={diaAlvo}
              setDiaAlvo={setDiaAlvo}
              arrastandoId={arrastandoId}
              abrirNovo={abrirNovo}
              abrirEdicao={abrirEdicao}
              iniciarArrasto={iniciarArrasto}
              encerrarArrasto={encerrarArrasto}
              soltarNoDia={soltarNoDia}
            />
          ) : (
            <VisaoLista
              diasDoMesComItens={diasDoMesComItens}
              ano={ano}
              mes={mes}
              hoje={hoje}
              setDiaSelecionado={setDiaSelecionado}
              setVisao={setVisao}
              abrirEdicao={abrirEdicao}
            />
          )}
        </div>

        <PainelDia
          diaSelecionado={diaSelecionado}
          hoje={hoje}
          itensDoDiaSelecionado={itensDoDiaSelecionado}
          totalDoMes={totalDoMes}
          ano={ano}
          mes={mes}
          abrirNovo={abrirNovo}
          abrirEdicao={abrirEdicao}
          alternarConcluido={alternarConcluido}
          naoSincronizado={naoSincronizado}
        />
      </div>

      <PainelSincronizacao
        urlFeed={urlFeed}
        google={google}
        retornoGoogle={retornoGoogle}
        onAtualizar={recarregarTudo}
      />

      {modal && (
        <ModalCompromisso
          modo={modal.modo}
          form={form}
          setForm={setForm}
          projetos={projetos}
          compromisso={modal.compromisso}
          googleAtivo={googleAtivo}
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
