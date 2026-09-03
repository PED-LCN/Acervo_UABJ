import { useEffect, useMemo, useState } from "react";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import { expressConnections, transportRoutes } from "../../data/transportRoutes";
import { estimatedTransportPlaces, transportPlaces } from "../../data/transportPlaces";
import type { TransportPeriod, TransportRoute } from "../../types/transport";
import "leaflet/dist/leaflet.css";
import "./TransportGuide.css";

const periods: TransportPeriod[] = ["Manhã", "Meio-dia", "Início da tarde", "Fim da tarde"];

interface OsrmResponse {
  code: string;
  routes?: Array<{ geometry: { coordinates: Array<[number, number]> } }>;
}

function FitRoute({ positions }: { positions: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions as LatLngBoundsExpression, { padding: [34, 34] });
  }, [map, positions]);
  return null;
}

function RouteMap({ route }: { route: TransportRoute }) {
  const points = useMemo(() => route.stops.map((stop, index) => ({ stop, index, place: transportPlaces[stop.name] })).filter(point => point.place), [route]);
  const directPath = useMemo<LatLngExpression[]>(() => points.map(({ place }) => [place.latitude, place.longitude]), [points]);
  const [roadPath, setRoadPath] = useState<LatLngExpression[]>([]);
  const [routingStatus, setRoutingStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const controller = new AbortController();
    const loadRoadPath = async () => {
      setRoutingStatus("loading");
      const coordinates = points.map(({ place }) => `${place.longitude},${place.latitude}`).join(";");
      try {
        const response = await fetch(`https://router.project-osrm.org/route/v1/driving/${coordinates}?overview=full&geometries=geojson`, { signal: controller.signal });
        if (!response.ok) throw new Error("Serviço de rotas indisponível");
        const payload = await response.json() as OsrmResponse;
        const geometry = payload.routes?.[0]?.geometry.coordinates;
        if (payload.code !== "Ok" || !geometry?.length) throw new Error("Trajeto não encontrado");
        setRoadPath(geometry.map(([longitude, latitude]) => [latitude, longitude]));
        setRoutingStatus("ready");
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setRoadPath(directPath);
        setRoutingStatus("fallback");
      }
    };
    void loadRoadPath();
    return () => controller.abort();
  }, [directPath, points]);

  const displayPath = roadPath.length ? roadPath : directPath;
  return <div className="transport-map" aria-label={`Mapa geográfico da ${route.label} no período ${route.period}`}>
    <div className="map-heading"><div><span>Mapa geográfico</span><strong>{route.label} · {route.vehicle}</strong></div><small>{routingStatus === "loading" ? "Calculando trajeto pelas ruas…" : routingStatus === "ready" ? "Trajeto aproximado pelas vias · OpenStreetMap" : "Ligação aproximada entre os pontos"}</small></div>
    <MapContainer className="leaflet-route-map" center={directPath[0] ?? [-8.337, -36.417]} zoom={14} scrollWheelZoom={false}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitRoute positions={directPath} />
      <Polyline positions={displayPath} pathOptions={{ color: route.color, weight: 6, opacity: .88 }} />
      {points.map(({ stop, index, place }) => <CircleMarker key={`${route.id}-${index}`} center={[place.latitude, place.longitude]} radius={9} pathOptions={{ color: "#fff", fillColor: route.color, fillOpacity: 1, weight: 3, dashArray: place.accuracy === "estimated" ? "3 3" : undefined }}>
        <Popup><div className="map-popup"><span>{index + 1}ª parada · {stop.time}</span><strong>{stop.name}</strong>{stop.detail && <small>{stop.detail}</small>}{place.accuracy === "estimated" && <em>Localização a confirmar</em>}{place.note && <p>{place.note}</p>}</div></Popup>
      </CircleMarker>)}
    </MapContainer>
    <div className="map-legend"><span><i />Local confirmado</span><span><i className="estimated" />Local estimado</span><span>Arraste para mover · use +/− para aproximar</span></div>
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

  return <div className="transport-page" id="transport">
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

    <details className="transport-review">
      <summary><span>Coordenadas que ainda precisam de confirmação</span><strong>{estimatedTransportPlaces.length} referências</strong></summary>
      <div><p>Abra o ponto exato no Google Maps, clique com o botão direito, copie o par de coordenadas e substitua os valores em <code>src/data/transportPlaces.ts</code>. Depois altere <code>accuracy</code> para <code>confirmed</code>.</p><ul>{estimatedTransportPlaces.map(place => <li key={place.name}><strong>{place.name}</strong><span>{place.latitude}, {place.longitude}</span><small>{place.note}</small></li>)}</ul></div>
    </details>

    <section className="transport-extras">
      <article><p className="eyebrow">Conexões diretas</p><h2>Expresso UABJ ↔ AEB</h2><div className="express-list">{expressConnections.map(connection => <div key={connection.period}><strong>{connection.period}</strong><span>{connection.departures.join(" · ")}</span><p>{connection.description}. {connection.note}</p></div>)}</div></article>
      <article><p className="eyebrow">Regras de operação</p><h2>Embarque com tranquilidade</h2><ul><li>Esteja no local alguns minutos antes.</li><li>As rotas funcionam em dias úteis, de segunda a quinta-feira.</li><li>Às sextas, a frota atende a outras atividades institucionais.</li><li>Observe a sinalização do veículo antes do embarque.</li></ul></article>
      <article className="transport-contact"><p className="eyebrow">Dúvidas e atualizações</p><h2>Fale com o transporte</h2><p>Encontrou alguma divergência ou precisa confirmar uma viagem?</p><a href="mailto:transporte.uabj@ufrpe.br">transporte.uabj@ufrpe.br</a></article>
    </section>
    <p className="transport-source">Informações transcritas do Guia de Mobilidade UABJ, edição de agosto de 2026. Consulte os canais institucionais para confirmar alterações.</p>
  </div>;
}
