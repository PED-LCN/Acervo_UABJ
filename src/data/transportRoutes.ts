import type { TransportRoute } from "../types/transport";

export const transportRoutes: TransportRoute[] = [
  { id: "manha-1", label: "Rota 1", period: "Manhã", vehicle: "Ônibus", color: "#d94b35", stops: [
    { time: "7h35", name: "Entrada da Cohab 1" }, { time: "7h37", name: "Praça da Criança" }, { time: "7h39", name: "Escola Dr. Sebastião Cabral" }, { time: "7h41", name: "Fórum" }, { time: "7h43", name: "Escola Prof. Donino" }, { time: "7h46", name: "Placa do Hospital Santa Fé" }, { time: "7h50", name: "UABJ" }, { time: "7h52", name: "AEB" },
  ] },
  { id: "manha-2", label: "Rota 2", period: "Manhã", vehicle: "Ônibus", color: "#e0a522", stops: [
    { time: "7h39", name: "Praça Maria Cristina" }, { time: "7h41", name: "Colégio Êxito" }, { time: "7h48", name: "Praça de Eventos" }, { time: "7h48", name: "Placa do Hospital Santa Fé", detail: "Rua Cel. Antônio Marinho" }, { time: "7h50", name: "UABJ" }, { time: "7h52", name: "AEB" },
  ] },
  { id: "manha-3", label: "Rota 3", period: "Manhã", vehicle: "Ônibus", color: "#1261a0", stops: [
    { time: "9h10", name: "AEB" }, { time: "9h12", name: "UABJ" }, { time: "9h14", name: "Entrada da Cohab 1" }, { time: "9h18", name: "Praça da Criança" }, { time: "9h20", name: "Escola Dr. Sebastião Cabral" }, { time: "9h22", name: "Trevo de Acesso", detail: "Hotel Asa Branca" }, { time: "9h24", name: "EREM João Monteiro" }, { time: "9h26", name: "Posto Petrovia", detail: "Trevo de Bom Conselho" }, { time: "9h28", name: "Centro", detail: "Oposto ao Bradesco" }, { time: "9h31", name: "Fórum" }, { time: "9h36", name: "Colégio Êxito" }, { time: "9h37", name: "Praça Maria Cristina" }, { time: "9h40", name: "Praça de Eventos" }, { time: "9h44", name: "Escola Prof. Donino" }, { time: "9h46", name: "Placa do Hospital Santa Fé" }, { time: "9h48", name: "UABJ" }, { time: "9h50", name: "AEB" },
  ] },
  { id: "meio-dia-1", label: "Rota 1", period: "Meio-dia", vehicle: "Ônibus", color: "#12a9a4", stops: [
    { time: "12h00", name: "AEB" }, { time: "12h05", name: "UABJ" }, { time: "12h10", name: "Cohab 1" }, { time: "12h13", name: "Praça da Criança" }, { time: "12h16", name: "Escola Dr. Sebastião Cabral" }, { time: "12h20", name: "Fórum" }, { time: "12h23", name: "Escola Prof. Donino" }, { time: "12h25", name: "Hospital Santa Fé" }, { time: "12h28", name: "UABJ" }, { time: "12h30", name: "AEB" },
  ] },
  { id: "meio-dia-2", label: "Rota 2", period: "Meio-dia", vehicle: "Micro-ônibus", color: "#dfaa13", stops: [
    { time: "12h00", name: "AEB" }, { time: "12h02", name: "UABJ" }, { time: "12h08", name: "Praça Maria Cristina" }, { time: "12h11", name: "Colégio Êxito" }, { time: "12h17", name: "Praça de Eventos" }, { time: "12h25", name: "Colegial" }, { time: "12h31", name: "Hospital Santa Fé" }, { time: "12h37", name: "UABJ" }, { time: "12h40", name: "AEB" },
  ] },
  { id: "tarde-3", label: "Rota 3", period: "Início da tarde", vehicle: "Ônibus", color: "#1467a8", stops: [
    { time: "13h30", name: "AEB" }, { time: "13h32", name: "UABJ" }, { time: "13h36", name: "Cohab 1" }, { time: "13h38", name: "Praça da Criança" }, { time: "13h40", name: "Escola Dr. Sebastião Cabral" }, { time: "13h42", name: "Fórum" }, { time: "13h44", name: "Escola Prof. Donino" }, { time: "13h46", name: "Placa do Hospital Santa Fé" }, { time: "13h48", name: "UABJ" }, { time: "13h50", name: "AEB" },
  ] },
  { id: "tarde-4", label: "Rota 4", period: "Início da tarde", vehicle: "Micro-ônibus", color: "#df8d13", stops: [
    { time: "13h30", name: "AEB" }, { time: "13h32", name: "UABJ" }, { time: "13h35", name: "Praça Maria Cristina" }, { time: "13h38", name: "Colégio Êxito" }, { time: "13h42", name: "Praça de Eventos" }, { time: "13h47", name: "Colegial" }, { time: "13h50", name: "Placa do Hospital Santa Fé" }, { time: "13h55", name: "UABJ" }, { time: "13h57", name: "AEB" },
  ] },
  { id: "fim-1", label: "Rota 1", period: "Fim da tarde", vehicle: "Ônibus", color: "#163c69", stops: [
    { time: "16h30", name: "AEB" }, { time: "16h33", name: "UABJ" }, { time: "16h38", name: "Cohab 1" }, { time: "16h41", name: "Praça da Criança" }, { time: "16h44", name: "Escola Dr. Sebastião Cabral" }, { time: "16h50", name: "Trevo de Acesso" }, { time: "16h53", name: "EREM João Monteiro" }, { time: "16h55", name: "Posto Petrovia" }, { time: "17h00", name: "Centro" }, { time: "17h02", name: "Fórum" }, { time: "17h07", name: "Colégio Êxito" }, { time: "17h09", name: "Praça Maria Cristina" }, { time: "17h14", name: "Praça de Eventos" }, { time: "17h19", name: "Escola Prof. Donino" }, { time: "17h22", name: "Placa do Hospital Santa Fé" },
  ] },
  { id: "fim-2", label: "Rota 2", period: "Fim da tarde", vehicle: "Ônibus", color: "#425f82", stops: [
    { time: "18h10", name: "AEB" }, { time: "18h13", name: "UABJ" }, { time: "18h18", name: "Cohab 1" }, { time: "18h21", name: "Praça da Criança" }, { time: "18h24", name: "Escola Dr. Sebastião Cabral" }, { time: "18h27", name: "Fórum" }, { time: "18h32", name: "Praça de Eventos" }, { time: "18h34", name: "Colégio Êxito" }, { time: "18h39", name: "Praça Maria Cristina" }, { time: "18h42", name: "Escola Prof. Donino" }, { time: "18h45", name: "Placa do Hospital Santa Fé" },
  ] },
];

export const expressConnections = [
  { period: "Manhã", departures: ["9h55", "10h05", "10h09"], description: "AEB → UABJ", note: "A última viagem termina no Colegial às 10h15." },
  { period: "Tarde", departures: ["15h55", "16h05", "16h09"], description: "AEB ↔ UABJ", note: "A última conexão termina na AEB." },
] as const;
