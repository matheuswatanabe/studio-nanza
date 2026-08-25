"use client";

// Monograma da marca: duas barras + uma faixa diagonal formam o "N",
// com o ponto final ecoando o símbolo original ("N."). As formas entram
// em sequência na primeira renderização — a única animação de carga do
// app, usada como assinatura visual das telas de acesso.
export default function Logomark({
  tone = "light",
  size = 72,
  animate = false,
  className = "",
}) {
  const fill = tone === "light" ? "#F3F4EF" : "#0B2A3D";

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label="Nanza"
      className={`${animate ? "logomark-animate" : ""} ${className}`}
    >
      <rect
        x="14"
        y="14"
        width="16"
        height="72"
        fill={fill}
        className="logomark-shape"
        style={{ "--d": "0ms" }}
      />
      <polygon
        points="30,14 46,14 86,86 70,86"
        fill={fill}
        className="logomark-shape"
        style={{ "--d": "90ms" }}
      />
      <rect
        x="70"
        y="14"
        width="16"
        height="72"
        fill={fill}
        className="logomark-shape"
        style={{ "--d": "160ms" }}
      />
      <circle
        cx="91"
        cy="90"
        r="6"
        fill={fill}
        className="logomark-shape logomark-dot"
        style={{ "--d": "260ms" }}
      />
    </svg>
  );
}
