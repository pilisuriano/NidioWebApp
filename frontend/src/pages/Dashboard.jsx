import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ArrowRight, Map, Calculator, HeartPulse, Building2, ExternalLink, MapPin } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import { formatPrice, formatDate, formatNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth";
export default function Dashboard() {
  const {
    user
  } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [properties, setProperties] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [lifeScores, setLifeScores] = useState([]);
  useEffect(() => {
    api.get("/api/heatmaps/price", {
      params: {
        operationType: "SALE"
      }
    }).then(res => {
      const rows = res.data.features.map(f => ({
        name: f.properties.neighborhoodName,
        precio: f.properties.avgPriceM2
      })).sort((a, b) => b.precio - a.precio).slice(0, 8);
      setChartData(rows);
    }).catch(() => setChartData([]));
    api.get("/api/properties", {
      params: {
        size: 2
      }
    }).then(res => setProperties(res.data.content)).catch(() => setProperties([]));
    api.get("/api/valuations").then(res => setValuations(res.data)).catch(() => {});
    api.get("/api/life-score").then(res => setLifeScores(res.data)).catch(() => {});
  }, []);
  const avgLifeScore = lifeScores.length > 0 ? (lifeScores.reduce((acc, q) => acc + q.totalScore, 0) / lifeScores.length).toFixed(1) : "—";
  return <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-on-surface">¡Hola, {user?.name?.split(" ")[0] ?? "Usuario"}!</h1>
        <p className="text-on-surface-variant">Resumen del mercado inmobiliario de CABA con datos sintéticos de demo.</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/mapa">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group border-primary/20 h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4 text-primary">
                <Map className="w-5 h-5" />
              </div>
              <CardTitle>Explorar propiedades</CardTitle>
              <CardDescription className="mt-2">Mapa de calor de precios por m² por barrio, con capas de ruido y seguridad.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <span className="text-sm font-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Ir al mapa <ArrowRight className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/valuacion">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-good-value/10 flex items-center justify-center mb-4 text-good-value">
                <Calculator className="w-5 h-5" />
              </div>
              <CardTitle>Valuación</CardTitle>
              <CardDescription className="mt-2">Estimá el rango de valor de mercado de cualquier propiedad de CABA.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <span className="text-sm font-bold text-good-value flex items-center gap-1 group-hover:gap-2 transition-all">
                Nueva valuación <ArrowRight className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        <Link to="/life-score">
          <Card className="bg-inverse-surface text-inverse-on-surface hover:shadow-md transition-shadow cursor-pointer group h-full">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-inverse-primary/20 flex items-center justify-center mb-4 text-inverse-primary">
                <HeartPulse className="w-5 h-5" />
              </div>
              <CardTitle className="text-inverse-on-surface">Life Score</CardTitle>
              <CardDescription className="text-inverse-on-surface/70 mt-2">Analizá el entorno urbano de una dirección según tus prioridades.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <span className="text-sm font-bold text-inverse-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Calcular score <ArrowRight className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent properties */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Propiedades destacadas</h2>
            <p className="text-sm text-on-surface-variant">Del catálogo sintético de CABA.</p>
          </div>
          <Link to="/mapa" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
            Ver todo <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {properties.map(p => <Card key={p.id} className="overflow-hidden">
              <div className="h-40 bg-surface-dim relative">
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
                <Badge className="absolute top-3 right-3" variant="good">
                  {p.operationType === "SALE" ? "VENTA" : "ALQUILER"}
                </Badge>
              </div>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-on-surface">{p.title}</h3>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> {p.neighborhoodName}, CABA
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-primary block text-sm">{formatPrice(p.price, p.operationType)}</span>
                  </div>
                </div>
                <div className="flex gap-4 text-xs font-mono border-t border-outline-variant pt-3">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.rooms} amb.</span>
                  <span className="ml-auto">{formatNumber(p.surfaceM2)} m²</span>
                </div>
              </CardContent>
            </Card>)}

          <Link to="/valuacion">
            <Card className="border-dashed border-2 border-outline-variant bg-transparent hover:bg-surface-container-low transition-colors flex items-center justify-center cursor-pointer h-full min-h-[200px]">
              <div className="text-center p-6 text-on-surface-variant">
                <div className="w-12 h-12 bg-surface-dim rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-2xl">+</span>
                </div>
                <p className="font-bold text-on-surface">Nueva consulta</p>
                <p className="text-xs mt-1">Valuá una propiedad o calculá un Life Score</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      {/* Analytics & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm text-outline uppercase tracking-widest">Precio promedio por m²</CardTitle>
              <CardDescription>Venta (USD/m²) — barrios más caros de CABA</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-64 mt-4">
            {chartData.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{
              top: 0,
              right: 0,
              left: 0,
              bottom: 0
            }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fontSize: 9,
                fill: "#6e797e"
              }} dy={10} interval={0} angle={-30} height={50} textAnchor="end" />
                  <YAxis hide />
                  <Tooltip cursor={{
                fill: "#f0f3ff"
              }} formatter={value => [`USD ${formatNumber(Number(value))}/m²`, "Precio"]} contentStyle={{
                borderRadius: "8px",
                border: "none",
                boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
              }} />
                  <Bar dataKey="precio" fill="#00647c" radius={[2, 2, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer> : <div className="h-full flex items-center justify-center text-sm text-on-surface-variant font-mono">
                Sin datos de precios
              </div>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-outline uppercase tracking-widest">Mi actividad</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                <Calculator className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Valuaciones realizadas</span>
                  <span className="text-primary">{valuations.length}</span>
                </div>
                {valuations[0] && <p className="text-xs text-on-surface-variant font-mono">
                    Última: {valuations[0].neighborhoodName} · {formatDate(valuations[0].createdAt)}
                  </p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-good-value/10 flex items-center justify-center text-good-value flex-shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Consultas Life Score</span>
                  <span className="text-good-value">{lifeScores.length}</span>
                </div>
                {lifeScores[0] && <p className="text-xs text-on-surface-variant font-mono">
                    Última: {lifeScores[0].address} · {formatDate(lifeScores[0].createdAt)}
                  </p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                <HeartPulse className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Life Score promedio</span>
                  <span className="text-secondary">{avgLifeScore}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">Sobre tus consultas guardadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
