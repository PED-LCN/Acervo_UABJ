export type TransportPeriod = "Manhã" | "Meio-dia" | "Início da tarde" | "Fim da tarde" | "Expressa";

export interface TransportStop {
  time: string;
  name: string;
  detail?: string;
  coordinates?: { latitude: number; longitude: number };
}

export interface TransportRoute {
  id: string;
  label: string;
  period: TransportPeriod;
  vehicle: "Ônibus" | "Micro-ônibus";
  color: string;
  stops: TransportStop[];
}
