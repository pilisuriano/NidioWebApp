import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { MapPin, SlidersHorizontal, Bus, ShoppingBag, TreePine, Cross, Utensils, Wine, GraduationCap, Calculator, AlertCircle } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
const CATEGORIES = [{
  key: "TRANSPORT",
  label: "Transporte",
  icon: Bus
}, {
  key: "COMMERCE",
  label: "Comercios",
  icon: ShoppingBag
}, {
  key: "GREEN_SPACE",
  label: "Espacios verdes",
  icon: TreePine
}, {
  key: "HEALTH",
  label: "Salud",
  icon: Cross
}, {
  key: "GASTRONOMY",
  label: "Gastronomía",
  icon: Utensils
}, {
  key: "NIGHTLIFE",
  label: "Vida nocturna",
  icon: Wine
}, {
  key: "EDUCATION",
  label: "Educación",
  icon: GraduationCap
}];
const CATEGORY_COLOR = {
  TRANSPORT: "#00647c",
  COMMERCE: "#4059aa",
  GREEN_SPACE: "#1F4D36",
  HEALTH: "#ba1a1a",
  GASTRONOMY: "#b45309",
  NIGHTLIFE: "#7c3aed",
  EDUCATION: "#0f766e"
};
function scoreLabel(score) {
  if (score >= 80) return "EXCELENTE";
  if (score >= 60) return "ÓPTIMO";
  if (score >= 40) return "NEUTRAL";
  return "BAJO";
}
export default function LifeScore() {
  const [address, setAddress] = useState("Av. Santa Fe 3253, Palermo");
  const [weights, setWeights] = useState({
    TRANSPORT: 4,
    COMMERCE: 5,
    GREEN_SPACE: 3,
    HEALTH: 2,
    GASTRONOMY: 4,
    NIGHTLIFE: 1,
    EDUCATION: 4
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  async function handleSubmit(e) {
    e?.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/api/life-score", {
        address,
        weights
      });
      setResult(res.data);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo calcular el Life Score"));
    } finally {
      setSubmitting(false);
    }
  }
  const score = result?.totalScore ?? null;
  const circumference = 282.7;
  return <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <h1 className="text-3xl font-bold text-on-surface">Life Score</h1>
        <Badge variant="secondary" className="px-3 py-1 text-[10px] tracking-widest uppercase">
          DATOS SINTÉTICOS (DEMO)
        </Badge>
      </div>
      <p className="text-on-surface-variant max-w-3xl font-mono text-sm">
        Calculá la calidad del entorno urbano de una dirección de CABA según la cercanía a 7 categorías de puntos de interés,
        ponderadas según tus prioridades.
      </p>

      {/* Dirección */}
      <form onSubmit={handleSubmit} className="flex bg-surface-container-lowest border border-outline-variant rounded-lg p-2 shadow-sm gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-3 h-5 w-5 text-outline" />
          <Input className="pl-10 border-none bg-transparent h-11 text-base shadow-none ring-0 focus-visible:ring-0" value={address} onChange={e => setAddress(e.target.value)} placeholder="Dirección en CABA (ej: Av. Cabildo 2100, Belgrano)" required />
        </div>
        <Button type="submit" disabled={submitting} className="h-11 px-6 gap-2 disabled:opacity-60">
          <Calculator className="w-4 h-4" /> {submitting ? "CALCULANDO…" : "CALCULAR"}
        </Button>
      </form>

      {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preferencias */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-sm font-bold text-on-surface uppercase tracking-widest flex items-center gap-2 mb-8">
              <SlidersHorizontal className="w-5 h-5 text-primary" />
              PREFERENCIA DE ANÁLISIS
            </h3>

            <div className="space-y-6">
              {CATEGORIES.map(item => <div key={item.key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-on-surface font-medium flex items-center gap-2">
                      <item.icon className="w-4 h-4 text-on-surface-variant" /> {item.label}
                    </span>
                    <span className="text-xs font-mono font-bold text-primary">{weights[item.key]}/5</span>
                  </div>
                  <input type="range" min={1} max={5} step={1} value={weights[item.key]} onChange={e => setWeights(w => ({
                ...w,
                [item.key]: Number(e.target.value)
              }))} className="w-full h-1.5 accent-[#00647c] cursor-pointer" />
                </div>)}
            </div>

            <Button onClick={() => handleSubmit()} disabled={submitting} className="w-full h-12 mt-8 text-base gap-2 disabled:opacity-60">
              <Calculator className="w-5 h-5" />
              {submitting ? "Calculando…" : "Calcular Life Score"}
            </Button>
          </CardContent>
        </Card>

        {/* Score */}
        <Card className="flex flex-col items-center justify-center text-center p-8 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 text-surface-dim opacity-20">
            <Calculator className="w-64 h-64" />
          </div>

          <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-10 z-10">
            PUNTAJE DE UBICACIÓN
          </h3>

          <div className="relative w-48 h-48 mb-8 z-10 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#cfdaf2" strokeWidth="8" />
              <circle cx="50" cy="50" r="45" fill="none" stroke="#00647c" strokeWidth="8" strokeDasharray={circumference} strokeDashoffset={circumference - circumference * ((score ?? 0) / 100)} strokeLinecap="round" style={{
              transition: "stroke-dashoffset 0.6s ease"
            }} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold text-primary tracking-tighter">
                {score != null ? Math.round(score) : "—"}
              </span>
              <span className="text-xs font-mono text-on-surface-variant mt-1">pts / 100</span>
            </div>
          </div>

          {score != null ? <>
              <Badge variant="outline" className="text-primary border-primary/30 mb-6 font-bold tracking-widest px-4 py-1.5 z-10">
                NIVEL: {scoreLabel(score)}
              </Badge>
              <p className="text-sm font-mono text-on-surface-variant max-w-[250px] z-10">
                {address}
              </p>
            </> : <p className="text-sm font-mono text-on-surface-variant max-w-[250px] z-10">
              Ingresá una dirección y calculá el score para ver el resultado.
            </p>}
        </Card>

        {/* Mapa */}
        <Card className="p-2 overflow-hidden bg-surface-container-lowest">
          <div className="w-full h-full rounded-lg relative overflow-hidden min-h-[400px]">
            {result ? <MapContainer key={result.id} center={[result.location.lat, result.location.lon]} zoom={15} className="w-full h-full min-h-[400px]">
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[result.location.lat, result.location.lon]}>
                  <Popup>{address}</Popup>
                </Marker>
                {result.categories.flatMap(cat => cat.pois.map((poi, i) => <CircleMarker key={`${cat.category}-${i}`} center={[poi.lat, poi.lon]} radius={6} pathOptions={{
              color: CATEGORY_COLOR[cat.category],
              fillColor: CATEGORY_COLOR[cat.category],
              fillOpacity: 0.7,
              weight: 1
            }}>
                      <Popup>
                        <strong>{poi.name}</strong>
                        <br />
                        {CATEGORIES.find(c => c.key === cat.category)?.label}
                      </Popup>
                    </CircleMarker>))}
              </MapContainer> : <div className="w-full h-full min-h-[400px] bg-[#e5e9f0] flex items-center justify-center">
                <p className="text-sm font-mono text-on-surface-variant text-center px-8">
                  El mapa con los POIs cercanos aparece acá después de calcular.
                </p>
              </div>}
          </div>
        </Card>
      </div>

      {/* POIs por categoría */}
      {result && <div className="space-y-4 pt-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-on-surface">Puntos de Interés Cercanos</h2>
            <p className="text-sm text-on-surface-variant font-mono">
              {result.categories.reduce((acc, c) => acc + c.poiCount, 0)} POIs en ~800 m
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {result.categories.filter(c => c.poiCount > 0).map(cat => {
          const meta = CATEGORIES.find(c => c.key === cat.category);
          const color = CATEGORY_COLOR[cat.category];
          return <Card key={cat.category} className="border-t-4" style={{
            borderTopColor: color
          }}>
                    <CardContent className="p-6 space-y-4">
                      <h4 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4" style={{
                color
              }}>
                        <meta.icon className="w-4 h-4" /> {meta.label} ({cat.poiCount})
                      </h4>

                      <div className="space-y-4">
                        {cat.pois.slice(0, 4).map((poi, i) => <div key={i} className="flex justify-between items-start border-b border-outline-variant/30 pb-3 last:border-0 last:pb-0">
                            <div>
                              <p className="font-bold text-sm text-on-surface">{poi.name}</p>
                              <p className="text-xs text-on-surface-variant mt-0.5 font-mono">
                                {poi.lat.toFixed(4)}, {poi.lon.toFixed(4)}
                              </p>
                            </div>
                            <Badge variant="good" className="bg-primary/5 text-primary shrink-0">
                              Peso {cat.weight}
                            </Badge>
                          </div>)}
                        {cat.pois.length > 4 && <p className="text-xs text-on-surface-variant font-mono">
                            + {cat.pois.length - 4} más en el mapa
                          </p>}
                      </div>
                    </CardContent>
                  </Card>;
        })}
          </div>
        </div>}
    </div>;
}
