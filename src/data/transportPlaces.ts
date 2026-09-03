import type { TransportPlace } from "../types/transport";

/*
 * Manual corrections belong here. In Google Maps, right-click the exact point,
 * copy the latitude/longitude pair and replace the values below. Change
 * `accuracy` to `confirmed` after checking the boarding location in person or
 * with the university transport team.
 */
export const transportPlaces: Record<string, TransportPlace> = {
  "AEB": { latitude: -8.3203125, longitude: -36.3955625, accuracy: "confirmed" },
  "UABJ": { latitude: -8.3270625, longitude: -36.4053125, accuracy: "confirmed" },
  "Entrada da Cohab 1": { latitude: -8.3450, longitude: -36.4095, accuracy: "estimated", note: "Posição aproximada na entrada do bairro Cohab I." },
  "Cohab 1": { latitude: -8.3450, longitude: -36.4095, accuracy: "estimated", note: "Usa provisoriamente a referência da entrada da Cohab I." },
  "Praça da Criança": { latitude: -8.3439517, longitude: -36.4138386, accuracy: "confirmed" },
  "Escola Dr. Sebastião Cabral": { latitude: -8.3421875, longitude: -36.4168125, accuracy: "confirmed" },
  "Fórum": { latitude: -8.3370261, longitude: -36.4189277, accuracy: "confirmed" },
  "Escola Prof. Donino": { latitude: -8.3331875, longitude: -36.4174375, accuracy: "confirmed" },
  "Hospital Santa Fé": { latitude: -8.3333125, longitude: -36.4130625, accuracy: "confirmed" },
  "Placa do Hospital Santa Fé": { latitude: -8.3333125, longitude: -36.4130625, accuracy: "estimated", note: "Marcador provisório no hospital; falta confirmar a posição exata da placa." },
  "Praça Maria Cristina": { latitude: -8.3222250, longitude: -36.4131207, accuracy: "estimated", note: "Referência provisória na Praça Eraldo Martins dos Santos, no bairro Maria Cristina." },
  "Colégio Êxito": { latitude: -8.3254375, longitude: -36.4186875, accuracy: "confirmed" },
  "Praça de Eventos": { latitude: -8.3283125, longitude: -36.4206875, accuracy: "confirmed" },
  "Trevo de Acesso": { latitude: -8.3461875, longitude: -36.4343125, accuracy: "confirmed", note: "Referência do Hotel e Churrascaria Asa Branca." },
  "EREM João Monteiro": { latitude: -8.3390625, longitude: -36.4325625, accuracy: "confirmed" },
  "Posto Petrovia": { latitude: -8.3373125, longitude: -36.4303125, accuracy: "confirmed" },
  "Centro": { latitude: -8.3373125, longitude: -36.4259375, accuracy: "confirmed", note: "Referência em frente ao Bradesco." },
  "Colegial": { latitude: -8.3336875, longitude: -36.4184375, accuracy: "estimated", note: "Referência provisória na Panificadora Nova Colegial." },
};

export const estimatedTransportPlaces = Object.entries(transportPlaces)
  .filter(([, place]) => place.accuracy === "estimated")
  .map(([name, place]) => ({ name, ...place }));
