// Endereço público do site ("https://dominio"), montado a partir dos
// cabeçalhos da requisição. Usado onde o site precisa informar a um serviço
// externo como voltar até ele: o feed .ics que o Google Agenda assina e o
// endereço de retorno do login com Google (que precisa bater exatamente com
// o cadastrado no Google Cloud).
export function origemDe(cabecalhos) {
  const host = cabecalhos.get("x-forwarded-host") ?? cabecalhos.get("host");
  if (!host) return "";

  const protocolo =
    cabecalhos.get("x-forwarded-proto")?.split(",")[0].trim() ??
    (host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https");

  return `${protocolo}://${host}`;
}
