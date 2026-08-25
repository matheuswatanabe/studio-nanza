// Painel ilustrativo das telas de acesso: um "orbe de identidade" desenhado
// só com os tokens da marca (gradiente ink/gold/paper), sobreposto por uma
// mira e uma trajetória pontilhada — reinterpretação da estética de
// "observação" sem depender de foto de banco de imagens.
export default function IdentityOrb({ orbDelay = "160ms", lineDelay = "260ms", pathDelay = "340ms", telemetryDelay = "420ms" }) {
  return (
    <div className="relative hidden h-full overflow-hidden rounded-[22px] bg-brand-ink-deep lg:block">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#F3F4EF 1px, transparent 1px), linear-gradient(90deg, #F3F4EF 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div
        aria-hidden
        className="orb-in absolute left-1/2 top-1/2 h-[340px] w-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          "--fd": orbDelay,
          background:
            "radial-gradient(circle at 32% 26%, #F3F4EF 0%, #B08D57 32%, #12384f 66%, #071b28 100%)",
          boxShadow:
            "0 0 0 1px rgba(243,244,239,0.08), 0 40px 80px -20px rgba(0,0,0,0.6)",
        }}
      />

      <div
        aria-hidden
        className="hairline-x pointer-events-none absolute left-0 right-0 top-1/2 h-px bg-brand-paper/20"
        style={{ "--fd": lineDelay }}
      />
      <div
        aria-hidden
        className="hairline-y pointer-events-none absolute bottom-0 top-0 left-1/2 w-px bg-brand-paper/20"
        style={{ "--fd": lineDelay }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-sm border border-brand-paper/40"
      />

      <svg
        aria-hidden
        viewBox="0 0 400 460"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
      >
        <path
          d="M 40 460 C 120 340, 140 220, 260 150 S 380 40, 420 -10"
          fill="none"
          stroke="#F3F4EF"
          strokeOpacity="0.28"
          strokeWidth="1"
          strokeDasharray="5 6"
        />
        <path
          className="path-draw"
          style={{ "--fd": pathDelay }}
          pathLength="1"
          d="M 0 90 C 100 60, 220 180, 400 130"
          fill="none"
          stroke="#B08D57"
          strokeOpacity="0.55"
          strokeWidth="1.25"
        />
      </svg>

      <div
        className="brand-panel-fade absolute bottom-8 left-8 rounded-lg border border-brand-paper/15 bg-brand-ink/60 px-4 py-3 font-mono text-[11px] leading-relaxed text-brand-paper/70 backdrop-blur-sm"
        style={{ "--fd": telemetryDelay }}
      >
        <p className="text-brand-gold">studio · nanza</p>
        <p>status&nbsp;&nbsp;ativo</p>
        <p>paleta&nbsp;&nbsp;0b2a3d / f3f4ef</p>
      </div>
    </div>
  );
}
