const TAMANHOS = {
  sm: "h-5 w-5 text-[10px]",
  md: "h-9 w-9 text-sm",
};

export default function Avatar({ nome, size = "sm" }) {
  if (!nome) return null;

  return (
    <span
      title={nome}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-brand-ink font-display font-medium text-brand-paper ${TAMANHOS[size]}`}
    >
      {nome.charAt(0).toUpperCase()}
    </span>
  );
}
