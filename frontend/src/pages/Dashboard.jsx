import { useEffect, useState } from "react";
import { optimizedImage, IMG_CARD } from "@/lib/images";
import { Link, useNavigate, useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import { buildMapUrl } from "@/lib/heroSearch";
import { ArrowRight, Map, Calculator, HeartPulse, Heart, Building2, ExternalLink, MapPin, Search, Plus, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, formatDate, formatNumber } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
import { useBlueRate } from "@/lib/blueRate";
import { valuationStatus } from "@/lib/valuation";
import { ValuationBadge } from "@/components/ui/ValuationBadge";
import { OperationBadge, FeaturedBadge } from "@/components/property/PropertyBadges";
import { MarketCharts } from "@/components/home/MarketCharts";
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
  // Cotización para comparar alquileres (ARS) contra la tasación (USD).
  const { blueRate } = useBlueRate();
  const navigate = useNavigate();
  // Con el menú de la izquierda cerrado (solo compu), el logo de nidio se muestra arriba del título de la portada.
  const { sidebarOpen = true } = useOutletContext() ?? {};
  const showHeroLogo = !sidebarOpen;
  // Cantidad de accesos rápidos visibles (para repartir las columnas): Explorar, Tasación y Publicar siempre;
  // Life Score y Recomendación solo para quien busca.
  const quickActionCount = 3 + (isProfessional ? 0 : 2);
  const [heroSearch, setHeroSearch] = useState("");
  // Botones del buscador: operación y tipo. Lo que se escribe también se interpreta (ver lib/heroSearch.js),
  // así "alquiler 2 ambientes palermo" funciona igual que elegir los botones y escribir el barrio.
  const [heroOperation, setHeroOperation] = useState("SALE");
  const [heroType, setHeroType] = useState("");
  const [properties, setProperties] = useState([]);
  // true si la lista son destacadas de verdad; si no hay ninguna activa se
  // muestran las publicaciones más recientes (con otro título).
  const [showingFeatured, setShowingFeatured] = useState(true);
  const [valuations, setValuations] = useState([]);
  const [lifeScores, setLifeScores] = useState([]);
  // Público: las destacadas se ven también sin iniciar sesión.
  useEffect(() => {
    api.get("/api/featured").then(res => {
      if (res.data.length > 0) {
        setProperties(res.data);
        setShowingFeatured(true);
        return;
      }
      setShowingFeatured(false);
      return api.get("/api/properties", {
        params: {
          size: 10
        }
      }).then(r => setProperties(r.data.content));
    }).catch(() => setProperties([]));
  }, []);
  useEffect(() => {
    if (!user) return;
    api.get("/api/valuations").then(res => setValuations(res.data)).catch(() => {});
    // Las cuentas profesionales no usan Life Score (es para quien busca
    // comprar/alquilar, no para quien publica), así que ni se pide.
    if (!isProfessional) {
      api.get("/api/life-score").then(res => setLifeScores(res.data)).catch(() => {});
    }
  }, [user, isProfessional]);
  function handleHeroSearch(e) {
    e.preventDefault();
    navigate(buildMapUrl(heroSearch, { operationType: heroOperation, propertyType: heroType }));
  }
  return <div className="animate-in fade-in duration-500">
      {/* Hero: foto de portada + búsqueda que lleva directo al mapa con el
          término ya cargado (HU de "Inicio" → "Explorar propiedades"). */}
      <div className="relative h-[420px] w-full overflow-hidden">
        <img src={HERO_IMAGE_URL} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center gap-6">
          {/* Logo arriba del título, alineado con su borde izquierdo. Va "absolute": no empuja el título ni cambia el alto de la
              portada. En pantallas angostas (< 1400px) se corre a la derecha para no pisar el botón del menú. */}
          {showHeroLogo && <Link to="/" aria-label="Ir al inicio" className="hidden lg:block absolute top-4 left-4 sm:left-6 lg:left-8 ml-14 min-[1400px]:ml-0">
              <img src="/logo.svg" alt="nidio" className="h-14 w-auto drop-shadow-md" />
            </Link>}
          <h1 className="text-5xl font-black text-white leading-[1.05] drop-shadow-sm">
            Menos búsqueda,
            <br />
            más certeza.
          </h1>
          <form onSubmit={handleHeroSearch} className="max-w-xl w-full space-y-2 relative top-5">
            <div className="flex flex-wrap items-center gap-2">
              <div role="group" aria-label="Operación" className="inline-flex rounded-full bg-black/35 backdrop-blur p-1">
                {[["SALE", "Comprar"], ["RENT", "Alquilar"]].map(([value, label]) => <button key={value} type="button" aria-pressed={heroOperation === value} onClick={() => setHeroOperation(value)} className={cn("px-4 py-1.5 rounded-full text-sm font-bold transition-colors", heroOperation === value ? "bg-white text-primary" : "text-white/90 hover:text-white")}>
                    {label}
                  </button>)}
              </div>
              <select value={heroType} onChange={e => setHeroType(e.target.value)} aria-label="Tipo de propiedad" className="h-9 pl-4 pr-8 rounded-full bg-white text-sm font-bold text-primary border-0 shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                {[["", "Tipo de propiedad"], ["APARTMENT", "Departamento"], ["HOUSE", "Casa"], ["PH", "PH"]].map(([value, label]) => <option key={value} value={value} className="text-on-surface">{label}</option>)}
              </select>
            </div>
            <div className="relative">
              <Input type="text" value={heroSearch} onChange={e => setHeroSearch(e.target.value)} aria-label="Buscar propiedades" placeholder="Barrio o dirección. Ej: 2 ambientes en Palermo" className="h-14 pl-5 pr-14 rounded-full text-base shadow-lg border-0" />
              <button type="submit" aria-label="Buscar" className="absolute right-2 top-2 w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center hover:opacity-90 transition-opacity">
                <Search className="w-5 h-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-on-surface">{user ? `¡Hola, ${user.name?.split(" ")[0]}!` : "Bienvenido a Nidio"}</h2>
      </div>

      {/* Quick Actions. "Publicar" es una card más acá (no hay botón arriba), con la misma explicación breve que el resto. */}
      <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${quickActionCount >= 5 ? "xl:grid-cols-5" : quickActionCount === 4 ? "lg:grid-cols-4" : quickActionCount === 3 ? "lg:grid-cols-3" : ""}`}>
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

        {!isProfessional && <Link to="/recomendador" className="flex h-full">
            <Card className="hover:shadow-md transition-shadow cursor-pointer group h-full w-full flex flex-col justify-between">
              <CardHeader>
                <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center mb-4 text-secondary">
                  <Sparkles className="w-5 h-5" />
                </div>
                <CardTitle>Recomendación</CardTitle>
                <CardDescription className="mt-2">Respondé unas preguntas y Nidi te recomienda las propiedades que mejor encajan con vos.</CardDescription>
              </CardHeader>
              <CardContent className="mt-4">
                <span className="text-sm font-bold text-secondary flex items-center gap-1 group-hover:gap-2 transition-all">
                  Empezar test <ArrowRight className="w-4 h-4" />
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

      {/* Destacadas (públicas) y, si no hay sesión, el promo de login */}
      {properties.length > 0 && <div className="space-y-4">
          <div className="flex justify-between items-end">
            <h2 className="text-xl font-bold text-on-surface">{showingFeatured ? "Propiedades destacadas" : "Propiedades recientes"}</h2>
            <Link to="/mapa" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Ver todo <ExternalLink className="w-4 h-4" />
            </Link>
          </div>

          <div className="flex gap-6 overflow-x-auto pb-2 snap-x snap-mandatory">
            {properties.map(p => <Link key={p.id} to={`/propiedades/${p.id}`} className="shrink-0 w-72 snap-start">
                <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
                  <div className="h-40 bg-surface-dim relative">
                    {p.imageUrl && <img src={optimizedImage(p.imageUrl, IMG_CARD)} alt={p.title} loading="lazy" className="w-full h-full object-cover" />}
                    <OperationBadge operationType={p.operationType} className="absolute top-3 right-3" />
                    {showingFeatured && <FeaturedBadge className="absolute top-3 left-3" />}
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
                    {valuationStatus(p, blueRate) && <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                        <span>Tasación Nidio</span>
                        <ValuationBadge result={valuationStatus(p, blueRate)} />
                      </div>}
                  </CardContent>
                </Card>
              </Link>)}
          </div>
        </div>}
      {!user && <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center py-6">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-on-surface leading-tight">Obtené un análisis para tu próxima propiedad</h2>
            <p className="text-on-surface-variant">Iniciá sesión para disfrutar de una experiencia completa.</p>
            <Link to="/auth/login" className="inline-flex items-center justify-center px-6 py-3 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary/5 transition-colors">
              Iniciar sesión
            </Link>
          </div>

          <div className="hidden md:flex items-center h-80">
            {/* Badges flotantes: lo que Nidio suma sobre el aviso (valor, entorno y recomendación).
                Van en su propia columna, centrados en el espacio entre el título y la ficha. */}
            <div className="flex-1 flex flex-col items-center gap-5 pr-2">
              <div className="bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant py-1.5 pl-1.5 pr-4 flex items-center gap-2 -translate-x-3">
                <span className="w-9 h-9 rounded-full bg-good-value/10 text-good-value flex items-center justify-center flex-shrink-0">
                  <Calculator className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-on-surface">Tasación</span>
              </div>
              <div className="bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant py-1.5 pl-1.5 pr-4 flex items-center gap-2 translate-x-3">
                <span className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                  <HeartPulse className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-on-surface">Life Score</span>
              </div>
              <div className="bg-surface-container-lowest rounded-full shadow-lg border border-outline-variant py-1.5 pl-1.5 pr-4 flex items-center gap-2 -translate-x-3">
                <span className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4" />
                </span>
                <span className="text-xs font-bold text-on-surface">Recomendación</span>
              </div>
            </div>

            <div className="relative w-72 h-80 flex-shrink-0">
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
            </div>
          </div>
        </div>}

      {/* Mercado: público */}
      <MarketCharts />

      {/* Mi actividad: solo con sesión */}
      {user && <div>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-outline uppercase tracking-widest">Mi actividad</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
