import { useEffect, useMemo, useState } from "react";
import { MapContainer, TileLayer, GeoJSON, CircleMarker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Search, MapPin, Building2 } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";

// Centro aproximado de CABA (lat, lon).
const CABA_CENTER = [-34.605, -58.43];
function priceColor(value, min, max) {
  // Interpolación simple de verde (barato) a rojo (caro).
  const t = max > min ? (value - min) / (max - min) : 0.5;
  const hue = 120 - 120 * t;
  return `hsl(${hue}, 70%, 45%)`;
}
function noiseColor(db) {
  const t = Math.max(0, Math.min(1, (db - 45) / 40));
  const hue = 60 - 60 * t; // amarillo → rojo
  return `hsl(${hue}, 85%, 50%)`;
}
function securityColor(index) {
  const t = Math.max(0, Math.min(1, index / 100));
  const hue = 120 * t; // rojo (inseguro) → verde (seguro)
  return `hsl(${hue}, 70%, 45%)`;
}
export default function MapPage() {
  const [layer, setLayer] = useState("price");
  const [operationType, setOperationType] = useState("SALE");
  const [priceData, setPriceData] = useState(null);
  const [noiseData, setNoiseData] = useState(null);
  const [securityData, setSecurityData] = useState(null);
  const [properties, setProperties] = useState([]);
  const [locations, setLocations] = useState({});
  const [search, setSearch] = useState("");
  useEffect(() => {
    api.get("/api/heatmaps/price", {
      params: {
        operationType
      }
    }).then(res => setPriceData(res.data)).catch(() => setPriceData(null));
  }, [operationType]);
  useEffect(() => {
    api.get("/api/heatmaps/noise").then(res => setNoiseData(res.data)).catch(() => {});
    api.get("/api/heatmaps/security").then(res => setSecurityData(res.data)).catch(() => {});
  }, []);
  useEffect(() => {
    api.get("/api/properties", {
      params: {
        operationType,
        size: 40
      }
    }).then(async res => {
      setProperties(res.data.content);
      // El listado no trae lat/lon: se piden los detalles para ubicar los pins.
      const details = await Promise.allSettled(res.data.content.slice(0, 40).map(p => api.get(`/api/properties/${p.id}`)));
      const locs = {};
      for (const d of details) {
        if (d.status === "fulfilled") {
          locs[d.value.data.id] = d.value.data.location;
        }
      }
      setLocations(locs);
    }).catch(() => setProperties([]));
  }, [operationType]);
  const [minPrice, maxPrice] = useMemo(() => {
    const values = priceData?.features.map(f => f.properties.avgPriceM2) ?? [];
    return values.length ? [Math.min(...values), Math.max(...values)] : [0, 1];
  }, [priceData]);
  const normalizedSearch = search.trim().toLowerCase();
  const visibleProperties = properties.filter(p => !normalizedSearch || p.neighborhoodName.toLowerCase().includes(normalizedSearch) || p.title.toLowerCase().includes(normalizedSearch));
  function onEachPriceFeature(feature, mapLayer) {
    const props = feature.properties;
    const unit = operationType === "SALE" ? "USD/m²" : "ARS/m²·mes";
    mapLayer.bindPopup(`<strong>${props.neighborhoodName}</strong><br/>` + `${formatNumber(props.avgPriceM2)} ${unit}<br/>` + `<span style="font-size:11px;color:#666">Período ${props.period}</span>`);
  }
  return <div className="h-full flex flex-col relative animate-in fade-in duration-500">
      {/* Barra superior */}
      <div className="absolute top-6 left-6 z-[1000] w-full max-w-md bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-2 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-5 h-5 text-outline" />
          <Input type="text" placeholder="Filtrar por barrio o título..." className="pl-10 border-none bg-transparent shadow-none ring-0 focus-visible:ring-0" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-lg border border-outline-variant overflow-hidden text-xs font-bold">
          {["SALE", "RENT"].map(op => <button key={op} onClick={() => setOperationType(op)} className={cn("px-3 transition-colors", operationType === op ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-dim")}>
              {op === "SALE" ? "Venta" : "Alquiler"}
            </button>)}
        </div>
      </div>

      {/* Selector de capas */}
      <div className="absolute top-6 right-6 z-[1000] bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant p-2 flex gap-1 text-xs font-bold">
        {[["price", "Precios m²"], ["noise", "Ruido"], ["security", "Seguridad"]].map(([kind, label]) => <button key={kind} onClick={() => setLayer(kind)} className={cn("px-3 py-2 rounded-lg transition-colors", layer === kind ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-dim")}>
            {label}
          </button>)}
      </div>

      {/* Mapa */}
      <div className="flex-1 w-full relative">
        <MapContainer center={CABA_CENTER} zoom={12} className="w-full h-full absolute inset-0">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {layer === "price" && priceData && <GeoJSON key={`price-${operationType}`} data={priceData} style={feature => ({
          color: "#ffffff",
          weight: 1,
          fillColor: priceColor((feature?.properties).avgPriceM2, minPrice, maxPrice),
          fillOpacity: 0.55
        })} onEachFeature={onEachPriceFeature} />}

          {layer === "noise" && noiseData && <GeoJSON key="noise" data={noiseData} style={feature => ({
          color: "#ffffff",
          weight: 1,
          fillColor: noiseColor((feature?.properties).noiseLevel),
          fillOpacity: 0.55
        })} onEachFeature={(feature, l) => l.bindPopup(`Nivel de ruido: <strong>${feature.properties.noiseLevel} dB</strong>`)} />}

          {layer === "security" && securityData && <GeoJSON key="security" data={securityData} style={feature => ({
          color: "#ffffff",
          weight: 1,
          fillColor: securityColor((feature?.properties).securityIndex),
          fillOpacity: 0.55
        })} onEachFeature={(feature, l) => {
          const props = feature.properties;
          l.bindPopup(`Índice de seguridad: <strong>${props.securityIndex}/100</strong><br/>Incidentes: ${props.crimeCount}`);
        }} />}

          {visibleProperties.map(p => {
          const loc = locations[p.id];
          if (!loc) return null;
          return <CircleMarker key={p.id} center={[loc.lat, loc.lon]} radius={7} pathOptions={{
            color: "#ffffff",
            weight: 2,
            fillColor: "#00647c",
            fillOpacity: 1
          }}>
                <Popup>
                  <strong>{p.title}</strong>
                  <br />
                  {p.neighborhoodName} · {formatNumber(p.surfaceM2)} m² · {p.rooms} amb
                  <br />
                  <span style={{
                color: "#00647c",
                fontWeight: 700
              }}>{formatPrice(p.price, p.operationType)}</span>
                </Popup>
              </CircleMarker>;
        })}
        </MapContainer>

        {/* Leyenda */}
        <div className="absolute bottom-40 left-6 z-[1000] bg-surface-container-lowest/90 backdrop-blur border border-outline-variant p-3 rounded-lg shadow-sm space-y-2 text-xs font-bold text-on-surface">
          {layer === "price" && <>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{
              background: "hsl(120,70%,45%)"
            }}></span>
                Más barato ({formatNumber(minPrice)})
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{
              background: "hsl(0,70%,45%)"
            }}></span>
                Más caro ({formatNumber(maxPrice)})
              </div>
              <div className="text-[10px] font-mono text-on-surface-variant">
                {operationType === "SALE" ? "USD/m²" : "ARS/m² por mes"}
              </div>
            </>}
          {layer === "noise" && <>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(60,85%,50%)"
            }}></span> Silencioso (~45 dB)</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(0,85%,50%)"
            }}></span> Ruidoso (~85 dB)</div>
            </>}
          {layer === "security" && <>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(120,70%,45%)"
            }}></span> Más seguro</div>
              <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{
              background: "hsl(0,70%,45%)"
            }}></span> Menos seguro</div>
            </>}
        </div>
      </div>

      {/* Panel inferior de propiedades */}
      <div className="absolute bottom-0 w-full bg-surface-container-lowest border-t border-outline-variant shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl p-6 z-[1000]">
        <div className="w-12 h-1.5 bg-outline/30 rounded-full mx-auto mb-4"></div>

        <div className="flex gap-6 overflow-x-auto pb-2 hide-scrollbar">
          {visibleProperties.length === 0 && <p className="text-sm text-on-surface-variant font-mono py-4">
              No hay propiedades para ese filtro.
            </p>}
          {visibleProperties.slice(0, 12).map(p => <Card key={p.id} className="min-w-[320px] flex-shrink-0 border-outline-variant relative overflow-hidden">
              <div className="p-4 flex gap-4">
                {p.imageUrl && <img src={p.imageUrl} className="w-20 h-20 rounded-lg object-cover bg-surface-dim" alt={p.title} />}
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-sm text-on-surface line-clamp-1">{p.title}</h4>
                    <Badge variant="good" className="text-[9px] px-1 py-0 h-4">
                      {p.operationType === "SALE" ? "VENTA" : "ALQ."}
                    </Badge>
                  </div>
                  <p className="text-xs text-on-surface-variant flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.neighborhoodName}
                  </p>
                  <div className="flex justify-between items-end pt-1">
                    <span className="font-bold text-primary text-sm">{formatPrice(p.price, p.operationType)}</span>
                    <span className="text-xs font-mono flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> {p.rooms} amb · {formatNumber(p.surfaceM2)} m²
                    </span>
                  </div>
                </div>
              </div>
            </Card>)}
        </div>
      </div>
    </div>;
}
