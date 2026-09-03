import { useMemo, useState } from "react";
import { expressConnections, transportRoutes } from "../../data/transportRoutes";
import type { TransportPeriod, TransportRoute } from "../../types/transport";
import "./TransportGuide.css";

const periods: TransportPeriod[] = ["Manhã", "Meio-dia", "Início da tarde", "Fim da tarde"];

function RouteMap({ route }: { route: TransportRoute }) {
  const width = 920;
  const rowSize = 6;
  const rowHeight = 132;
  const rows = Math.ceil(route.stops.length / rowSize);
  const height = Math.max(190, rows * rowHeight + 35);
  const points = route.stops.map((_, index) => {
    const row = Math.floor(index / rowSize);
    const indexInRow = index % rowSize;
    const itemsInRow = Math.min(rowSize, route.stops.length - row * rowSize);
    const goingRight = row % 2 === 0;
    const slot = goingRight ? indexInRow : itemsInRow - indexInRow - 1;
    const x = itemsInRow === 1 ? width / 2 : 62 + slot * ((width - 124) / (itemsInRow - 1));
    return { x, y: 60 + row * rowHeight };
  });
  const path = points.map((point, index) => `${index ? "L" : "M"} ${point.x} ${point.y}`).join(" ");

  return <div className="transport-map" aria-label={`Mapa esquemático da ${route.label} no período ${route.period}`}>
    <div className="map-heading"><div><span>Mapa do trajeto</span><strong>{route.label} · {route.vehicle}</strong></div><small>Representação esquemática, não geográfica</small></div>
    <div className="map-scroll"><svg viewBox={`0 0 ${width} ${height}`} role="img">
      <path className="route-shadow" d={path} /><path className="route-line" d={path} style={{ stroke: route.color }} />
      {points.map((point, index) => <g key={`${route.id}-${index}`} transform={`translate(${point.x} ${point.y})`}>
        <circle className="stop-halo" r="16" /><circle className="stop-dot" r="8" style={{ fill: route.color }} />
        <text className="stop-time" y="-23" textAnchor="middle">{route.stops[index].time}</text>
        <foreignObject x="-65" y="18" width="130" height="54"><div className="stop-label">{route.stops[index].name}<small>{route.stops[index].detail}</small></div></foreignObject>
      </g>)}
    </svg></div>
  </div>;
}

export function TransportGuide() {
  const [period, setPeriod] = useState<TransportPeriod>("Manhã");
  const availableRoutes = useMemo(() => transportRoutes.filter(route => route.period === period), [period]);
  const [selectedId, setSelectedId] = useState(transportRoutes[0].id);
  const selectedRoute = availableRoutes.find(route => route.id === selectedId) ?? availableRoutes[0];
  const choosePeriod = (nextPeriod: TransportPeriod) => {
    setPeriod(nextPeriod);
    setSelectedId(transportRoutes.find(route => route.period === nextPeriod)?.id ?? "");
  };

  return <div className="transport-page">
    <section className="transport-hero">
      <div><p className="eyebrow">Mobilidade UABJ</p><h1>Planeje seu caminho até o campus.</h1><p>Consulte os horários, acompanhe a sequência de paradas e compare as rotas oficiais de transporte universitário.</p></div>
      <div className="transport-alert"><strong>Antes de sair</strong><p>Chegue ao ponto com alguns minutos de antecedência. Horários são estimativas e podem variar com o trânsito.</p></div>
    </section>

    <section className="transport-catalog" aria-labelledby="transport-title">
      <div className="transport-sidebar">
        <p className="eyebrow">Catálogo de rotas</p><h2 id="transport-title">Escolha um período</h2>
        <div className="period-tabs">{periods.map(item => <button key={item} className={item === period ? "active" : ""} onClick={() => choosePeriod(item)}>{item}</button>)}</div>
        <div className="route-options">{availableRoutes.map(route => <button key={route.id} className={route.id === selectedRoute.id ? "active" : ""} onClick={() => setSelectedId(route.id)} style={{ "--route-color": route.color } as React.CSSProperties}><span>{route.label}</span><small>{route.vehicle} · {route.stops[0].time}–{route.stops.at(-1)?.time}</small></button>)}</div>
        <div className="route-summary"><span><strong>{selectedRoute.stops.length}</strong> pontos</span><span><strong>{selectedRoute.stops[0].time}</strong> partida</span><span><strong>{selectedRoute.stops.at(-1)?.time}</strong> chegada</span></div>
      </div>
      <RouteMap route={selectedRoute} />
    </section>

    <section className="transport-extras">
      <article><p className="eyebrow">Conexões diretas</p><h2>Expresso UABJ ↔ AEB</h2><div className="express-list">{expressConnections.map(connection => <div key={connection.period}><strong>{connection.period}</strong><span>{connection.departures.join(" · ")}</span><p>{connection.description}. {connection.note}</p></div>)}</div></article>
      <article><p className="eyebrow">Regras de operação</p><h2>Embarque com tranquilidade</h2><ul><li>Esteja no local alguns minutos antes.</li><li>As rotas funcionam em dias úteis, de segunda a quinta-feira.</li><li>Às sextas, a frota atende a outras atividades institucionais.</li><li>Observe a sinalização do veículo antes do embarque.</li></ul></article>
      <article className="transport-contact"><p className="eyebrow">Dúvidas e atualizações</p><h2>Fale com o transporte</h2><p>Encontrou alguma divergência ou precisa confirmar uma viagem?</p><a href="mailto:transporte.uabj@ufrpe.br">transporte.uabj@ufrpe.br</a></article>
    </section>
    <p className="transport-source">Informações transcritas do Guia de Mobilidade UABJ, edição de agosto de 2026. Consulte os canais institucionais para confirmar alterações.</p>
  </div>;
}
