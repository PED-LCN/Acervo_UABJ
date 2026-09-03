export type TransportPeriod = "Manhã" | "Meio-dia" | "Início da tarde" | "Fim da tarde" | "Expressa";

export interface TransportStop {
  time: string;
  name: string;
  detail?: string;
}

export interface TransportPlace {
  latitude: number;
  longitude: number;
  accuracy: "confirmed" | "estimated";
  note?: string;
}

export interface TransportRoute {
  id: string;
  label: string;
  period: TransportPeriod;
  vehicle: "Ônibus" | "Micro-ônibus";
  color: string;
  stops: TransportStop[];
}
