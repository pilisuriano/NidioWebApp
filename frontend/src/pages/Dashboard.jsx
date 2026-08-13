import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { ArrowRight, Map, Calculator, HeartPulse, Heart, Building2, ExternalLink, MapPin, Search, Plus } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { api } from "@/lib/api";
import { formatPrice, formatDate, formatNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
// Foto ilustrativa de banco abierto (Unsplash), igual criterio que las
// fotos de propiedades del catálogo sintético — sin costo, sin API key.
// Pareja recibiendo las llaves de su casa nueva (tags: real estate, moving,
// key, new house): momento de mudanza, no solo un edificio de fondo.
const HERO_IMAGE_URL = "https://images.unsplash.com/photo-1758523671285-9ff3f4e0ff38?auto=format&fit=crop&q=80&w=2400";
// Misma foto que ya usa el catálogo sintético de propiedades (ver
// ml-service/scripts/generate_remaining_barrios.py), para la ficha de
// ejemplo del promo de login.
const MOCK_PROPERTY_IMAGE_URL = "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=800&h=500";
export default function Dashboard() {
  const {
    user
  } = useAuth();
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const { favoriteCount } = useFavorites();
  const navigate = useNavigate();
  const [heroSearch, setHeroSearch] = useState("");
  const [chartData, setChartData] = useState([]);
  const [properties, setProperties] = useState([]);
  const [valuations, setValuations] = useState([]);
  const [lifeScores, setLifeScores] = useState([]);
  useEffect(() => {
    if (!user) return;
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
        size: 10
      }
    }).then(res => setProperties(res.data.content)).catch(() => setProperties([]));
    api.get("/api/valuations").then(res => setValuations(res.data)).catch(() => {});
    // Las cuentas profesionales no usan Life Score (es para quien busca
    // comprar/alquilar, no para quien publica), así que ni se pide.
    if (!isProfessional) {
      api.get("/api/life-score").then(res => setLifeScores(res.data)).catch(() => {});
    }
  }, [user, isProfessional]);
  function handleHeroSearch(e) {
    e.preventDefault();
    const q = heroSearch.trim();
    navigate(q ? `/mapa?search=${encodeURIComponent(q)}` : "/mapa");
  }
  return <div className="animate-in fade-in duration-500">
      {/* Hero: foto de portada + búsqueda que lleva directo al mapa con el
          término ya cargado (HU de "Inicio" → "Explorar propiedades"). */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <img src={HERO_IMAGE_URL} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative h-full max-w-7xl mx-auto px-8 flex flex-col justify-center gap-6">
          <h1 className="text-5xl font-black text-white leading-[1.05] drop-shadow-sm">
            Menos búsqueda,
            <br />
            más certeza.
          </h1>
          <form onSubmit={handleHeroSearch} className="max-w-md w-full">
            <div className="relative">
              <Input type="text" value={heroSearch} onChange={e => setHeroSearch(e.target.value)} placeholder="Ingresá un barrio, dirección o título..." className="h-14 pl-5 pr-14 rounded-full text-base shadow-lg border-0" />
              <button type="submit" aria-label="Buscar" className="absolute right-2 top-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-on-surface">{user ? `¡Hola, ${user.name?.split(" ")[0]}!` : "Bienvenido a Nidio"}</h2>
      </div>

      {/* Quick Actions. "Publicar" vivía como botón suelto en la barra de
          arriba (ya sacada de MainLayout); ahora es una card más acá, con
          la misma explicación breve que el resto. */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link to="/mapa" className="flex h-full">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group border-primary/20 h-full w-full flex flex-col justify-between">
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

        <Link to="/tasacion" className="flex h-full">
          <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full w-full flex flex-col justify-between">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-good-value/10 flex items-center justify-center mb-4 text-good-value">
                <Calculator className="w-5 h-5" />
              </div>
              <CardTitle>Tasación</CardTitle>
              <CardDescription className="mt-2">Estimá el rango de valor de mercado de cualquier propiedad de CABA.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <span className="text-sm font-bold text-good-value flex items-center gap-1 group-hover:gap-2 transition-all">
                Nueva tasación <ArrowRight className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </Link>

        {!isProfessional && <Link to="/life-score" className="flex h-full">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full w-full flex flex-col justify-between">
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <CardTitle>Life Score</CardTitle>
                <CardDescription className="mt-2">Analizá el entorno urbano de una dirección según tus prioridades.</CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <span className="text-sm font-bold text-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Calcular score <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          </Link>}

        <Link to="/publicar" className="flex h-full">
          <Card className="bg-inverse-surface text-inverse-on-surface hover:shadow-md transition-shadow cursor-pointer group h-full w-full flex flex-col justify-between">
            <CardHeader>
              <div className="w-10 h-10 rounded-full bg-inverse-primary/20 flex items-center justify-center mb-4 text-inverse-primary">
                <Plus className="w-5 h-5" />
              </div>
              <CardTitle className="text-inverse-on-surface">Publicar propiedad</CardTitle>
              <CardDescription className="text-inverse-on-surface/70 mt-2">Cargá un nuevo aviso al catálogo de Nidio en pocos pasos.</CardDescription>
            </CardHeader>
            <CardContent className="mt-4">
              <span className="text-sm font-bold text-inverse-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Publicar aviso <ArrowRight className="w-4 h-4" />
              </span>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Recent properties (o promo de login, si no hay sesión) */}
      {user ? <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-on-surface">Propiedades destacadas</h2>
            <Link to="/mapa" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Ver todo <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory">
            {properties.map(p => <Link key={p.id} to={`/propiedades/${p.id}`} className="shrink-0 w-72 snap-start">
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
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
                </Card>
              </Link>)}
          </div>
        </div> : <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-on-surface leading-tight">Obtené un análisis para tu próxima propiedad</h2>
            <p className="text-on-surface-variant">Iniciá sesión para disfrutar de una experiencia completa.</p>
            <Link to="/auth/login" className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">
              Iniciar sesión
            </Link>
          </div>

          <div className="relative h-80 hidden md:block">
            {/* Card de fondo, decorativa (da sensación de pila de fichas) */}
            <div className="absolute top-14 right-0 w-60 h-64 rounded-2xl bg-surface-dim rotate-6 shadow-md" />
            {/* Ficha de propiedad de ejemplo */}
            <div className="absolute top-6 right-6 w-64 bg-surface-container-lowest rounded-2xl shadow-xl border border-outline-variant overflow-hidden">
              <img src={MOCK_PROPERTY_IMAGE_URL} alt="" className="w-full h-32 object-cover" />
              <div className="p-4 space-y-2">
                <p className="font-bold text-lg text-on-surface">USD 245.000</p>
                <p className="text-xs font-mono text-on-surface-variant">3 amb · 68 m² · Depto en venta</p>
                <div className="h-2 bg-surface-dim rounded-full w-full mt-2" />
                <div className="h-2 bg-surface-dim rounded-full w-2/3" />
              </div>
            </div>
            {/* Badges flotantes: los 2 datos que Nidio suma sobre el aviso */}
            <div className="absolute top-0 left-0 z-10 bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant py-1.5 pl-1.5 pr-4 flex items-center gap-2 max-w-[240px]">
              <span className="w-9 h-9 rounded-full bg-good-value/10 text-good-value flex items-center justify-center flex-shrink-0">
                <Calculator className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-on-surface">Rango de valor</span>
            </div>
            <div className="absolute top-24 left-2 z-10 bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant py-1.5 pl-1.5 pr-4 flex items-center gap-2 max-w-[240px]">
              <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <HeartPulse className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold text-on-surface">Life Score</span>
            </div>
          </div>
        </div>}

      {/* Analytics & Stats */}
      {user && <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              right: 16,
              // 55 (antes 16): la etiqueta del primer barrio ("Puerto
              // Madero"), rotada -35°, se extendía más a la izquierda de lo
              // que dejaba el margen viejo y el SVG se la recortaba.
              left: 55,
              bottom: 12
            }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{
                fontSize: 9,
                fill: "#6e797e"
              }} dy={10} interval={0} angle={-35} height={55} textAnchor="end" />
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

            {!isProfessional && <div className="flex items-center gap-4">
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
            </div>}

            {!isProfessional && <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded bg-secondary/10 flex items-center justify-center text-secondary flex-shrink-0">
                <Heart className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>Mis favoritos</span>
                  <span className="text-secondary">{favoriteCount}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">Propiedades guardadas</p>
              </div>
            </div>}
          </CardContent>
        </Card>
      </div>}
      </div>
    </div>;
}
