import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "@/lib/leaflet-setup";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, MapPin, Building2, Calculator, HeartPulse, CheckCircle2, AlertTriangle, Info, Camera, ChevronLeft, ChevronRight, ChevronDown, Ruler, DoorOpen, Bath, CalendarClock, Compass, Building, User as UserIcon, Mail, Phone, BadgeCheck, X } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { formatPrice, formatNumber, PROPERTY_TYPE_LABEL, OPERATION_TYPE_LABEL, PUBLISHER_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "react-toastify";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { COUNTRY_CODES } from "@/lib/countries";

// Preguntas rápidas tipo Zonaprop ("Preguntas para la inmobiliaria"): en vez
// de escribir desde cero, un click completa el mensaje.
const QUICK_QUESTIONS = ["¿Sigue disponible?", "¿Se puede coordinar una visita?", "¿Acepta financiación?", "¿Incluye cochera?"];

// Borde/anillo rojo para un campo obligatorio sin completar, mismo criterio
// que el formulario de registro.
const INVALID_CLASS = "border-error focus-visible:ring-2 focus-visible:ring-error";

// Pin de ubicación con divIcon en vez del ícono default de Leaflet: el
// marker.png/marker-shadow.png default no está resolviendo bien en este
// mapa (se veía como imagen rota), así que se dibuja con CSS puro — sin
// depender de ningún asset externo.
const LOCATION_PIN_ICON = L.divIcon({
  className: "location-pin-icon",
  html: '<div class="location-pin"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11]
});

// Life Score bajo demanda: si la propiedad no tiene uno calculado, se pide
// con ponderación neutral (todas las categorías en 3/5) — el usuario puede
// después ir a la pantalla de Life Score a personalizar sus prioridades.
const NEUTRAL_LIFE_SCORE_WEIGHTS = {
  TRANSPORT: 3,
  COMMERCE: 3,
  GREEN_SPACE: 3,
  HEALTH: 3,
  GASTRONOMY: 3,
  NIGHTLIFE: 3,
  EDUCATION: 3
};

// Mismo criterio y estilos que el ResultBadge de las tasaciones, para que la
// clasificación se vea igual en toda la app.
function ValuationBadge({ result }) {
  if (result === "FAIR") {
    return <Badge variant="good" className="bg-good-value/5 gap-1 border border-good-value/20">
        <CheckCircle2 className="w-3 h-3" /> EN RANGO
      </Badge>;
  }
  if (result === "OVERVALUED") {
    return <Badge variant="alert" className="gap-1">
        <AlertTriangle className="w-3 h-3" /> SOBREVALUADA
      </Badge>;
  }
  if (result === "UNDERVALUED") {
    return <Badge variant="secondary" className="bg-secondary/10 text-secondary gap-1 border border-secondary/20">
        <Info className="w-3 h-3" /> SUBVALUADA
      </Badge>;
  }
  return null;
}

export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  // Las cuentas profesionales publican avisos, no contactan a otros
  // publicadores como si fueran un comprador/inquilino más — perfil más
  // profesional, sin la función de contacto.
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const [property, setProperty] = useState(null);
  // No tiene sentido mandarse un mail a una misma: si la propiedad la
  // publicó el usuario logueado, se muestra un aviso en vez del formulario.
  const isOwner = Boolean(user?.email && property?.createdByEmail && user.email.toLowerCase() === property.createdByEmail.toLowerCase());
  const [error, setError] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [message, setMessage] = useState("¡Hola! Quiero que se comuniquen conmigo por esta propiedad que vi en Nidio.");
  const [contactName, setContactName] = useState(user?.name ?? "");
  const [contactPhone, setContactPhone] = useState(user?.phone ?? "");
  // Argentina por default (la app es de CABA), pero se puede elegir
  // cualquier otro país de la lista completa. Combobox propio en vez de
  // <select> nativo: el control cerrado muestra solo el código (+54), no el
  // nombre del país (que se recortaba feo con el ancho de la columna) — el
  // nombre completo se ve al abrir la lista, buscable.
  const [countryCode, setCountryCode] = useState("+54");
  const [countryOpen, setCountryOpen] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const countryRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (countryRef.current && !countryRef.current.contains(e.target)) {
        setCountryOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [contactError, setContactError] = useState(null);
  // Se activa recién en el primer intento de envío: antes de eso no tiene
  // sentido marcar nada en rojo.
  const [contactAttempted, setContactAttempted] = useState(false);
  const [calculatedValuation, setCalculatedValuation] = useState(null);
  const [calculatingValuation, setCalculatingValuation] = useState(false);
  const [valuationError, setValuationError] = useState(null);
  const [calculatedLifeScore, setCalculatedLifeScore] = useState(null);
  const [calculatingLifeScore, setCalculatingLifeScore] = useState(false);
  const [lifeScoreError, setLifeScoreError] = useState(null);

  useEffect(() => {
    setProperty(null);
    setError(null);
    setActiveImage(0);
    setSent(false);
    setMessage("¡Hola! Quiero que se comuniquen conmigo por esta propiedad que vi en Nidio.");
    setContactAttempted(false);
    setTermsAccepted(false);
    setPrivacyAccepted(false);
    setCalculatedValuation(null);
    setCalculatedLifeScore(null);
    api.get(`/api/properties/${id}`).then(res => setProperty(res.data)).catch(err => setError(apiErrorMessage(err, "No se pudo cargar la propiedad")));
  }, [id]);

  // El usuario puede llegar antes de que /api/auth/me termine de resolver
  // (AuthProvider carga async), así que los campos del formulario se
  // sincronizan con el perfil apenas está disponible.
  useEffect(() => {
    if (user) {
      setContactName(user.name ?? "");
      setContactPhone(user.phone ?? "");
    }
  }, [user]);

  function validateContact() {
    const errors = {};
    if (!contactName.trim()) errors.contactName = true;
    if (!contactPhone.trim()) errors.contactPhone = true;
    if (!message.trim()) errors.message = true;
    return errors;
  }

  async function handleContact(e) {
    e.preventDefault();
    setContactAttempted(true);
    const errors = validateContact();
    if (Object.keys(errors).length > 0) {
      setContactError("Completá los campos obligatorios, marcados en rojo.");
      return;
    }
    setContactError(null);
    setSending(true);
    try {
      // Si la persona editó su nombre o teléfono en el formulario, se
      // actualiza el perfil de paso. Importante: updateProfile pisa los 3
      // campos del perfil (name/dni/phone) sin mergear, así que hay que
      // mandar el dni actual sin tocar para no perderlo.
      if (contactName.trim() !== (user.name ?? "") || contactPhone.trim() !== (user.phone ?? "")) {
        await updateProfile({ name: contactName.trim() || user.name, dni: user.dni, phone: contactPhone.trim() || null });
      }
      await api.post(`/api/properties/${id}/contact`, { message });
      setSent(true);
      setMessage("");
      toast.success("Mensaje enviado");
    } catch (err) {
      setContactError(apiErrorMessage(err, "No se pudo enviar el mensaje"));
    } finally {
      setSending(false);
    }
  }

  async function handleCalcValuation() {
    setValuationError(null);
    setCalculatingValuation(true);
    try {
      const res = await api.post("/api/valuations", {
        operationType: property.operationType,
        propertyType: property.propertyType,
        neighborhoodId: property.neighborhood.id,
        surfaceM2: property.surfaceM2,
        rooms: property.rooms,
        declaredPrice: property.price
      });
      setCalculatedValuation(res.data);
    } catch (err) {
      setValuationError(apiErrorMessage(err, "No se pudo calcular la tasación"));
    } finally {
      setCalculatingValuation(false);
    }
  }

  async function handleCalcLifeScore() {
    setLifeScoreError(null);
    setCalculatingLifeScore(true);
    try {
      const res = await api.post("/api/life-score", {
        address: `${property.address}, ${property.neighborhood.name}, CABA`,
        weights: NEUTRAL_LIFE_SCORE_WEIGHTS
      });
      setCalculatedLifeScore(res.data);
    } catch (err) {
      setLifeScoreError(apiErrorMessage(err, "No se pudo calcular el Life Score"));
    } finally {
      setCalculatingLifeScore(false);
    }
  }

  if (error) {
    return <div className="p-8 max-w-2xl mx-auto text-center space-y-3">
        <p className="text-on-surface-variant">{error}</p>
        <Link to="/mapa" className="text-primary font-semibold hover:underline">Volver a explorar</Link>
      </div>;
  }

  if (!property) {
    return <div className="p-8 text-center text-on-surface-variant font-mono text-sm">Cargando…</div>;
  }

  const images = property.imageUrls ?? [];
  const gridImages = images.slice(1, 5);
  const extraCount = images.length - 5;

  function openLightbox(index) {
    setActiveImage(index);
    setLightboxOpen(true);
  }

  // Tasación: si la propiedad ya trae un rango calculado (catálogo
  // sintético) se usa ese; si no, se ofrece calcularlo al toque contra
  // /api/valuations con los mismos datos de la propiedad.
  const valuationRange = property.valuation ?? (calculatedValuation ? { min: calculatedValuation.estimatedMin, max: calculatedValuation.estimatedMax } : null);
  let valuationResult = null;
  if (property.valuation) {
    if (property.price < property.valuation.min) valuationResult = "UNDERVALUED";
    else if (property.price > property.valuation.max) valuationResult = "OVERVALUED";
    else valuationResult = "FAIR";
  } else if (calculatedValuation) {
    valuationResult = calculatedValuation.result;
  }

  const lifeScoreValue = property.lifeScore ?? calculatedLifeScore?.totalScore ?? null;
  const contactFieldErrors = contactAttempted ? validateContact() : {};

  return <div className="p-8 max-w-6xl mx-auto space-y-6 animate-in fade-in duration-500">
      <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors">
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      {/* Galería estilo Zonaprop: foto grande + mosaico de 4, con "ver todas
          las fotos" sobre la última si hay más. Al tocar cualquier foto se
          abre un visor a pantalla completa. */}
      <div className="relative">
        {images.length === 0
          ? <div className="h-96 rounded-xl bg-surface-dim flex items-center justify-center text-on-surface-variant text-sm font-mono">Sin fotos</div>
          : images.length === 1
          ? <button type="button" onClick={() => openLightbox(0)} className="block w-full h-[420px] rounded-xl overflow-hidden bg-surface-dim">
              <img src={images[0]} alt={property.title} className="w-full h-full object-contain" />
            </button>
          : <div className="grid grid-cols-4 grid-rows-2 gap-1.5 h-[420px] rounded-xl overflow-hidden">
              <button type="button" onClick={() => openLightbox(0)} className="col-span-2 row-span-2 relative bg-surface-dim">
                <img src={images[0]} alt={property.title} className="w-full h-full object-contain" />
                <span className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                  <Camera className="w-3.5 h-3.5" /> {images.length}
                </span>
              </button>
              {/* Las miniaturas ocupan siempre todo el espacio disponible a la
                  derecha (sin cuadrados grises vacíos), sea cual sea la
                  cantidad de fotos extra que haya (1 a 4). */}
              {gridImages.map((url, i) => {
                const showOverlay = i === gridImages.length - 1 && extraCount > 0;
                const spanClass = gridImages.length === 1
                  ? "col-span-2 row-span-2"
                  : gridImages.length === 2
                  ? "row-span-2"
                  : gridImages.length === 3 && i === 2
                  ? "col-span-2"
                  : "";
                return <button key={url + i} type="button" onClick={() => openLightbox(i + 1)} className={cn("relative bg-surface-dim", spanClass)}>
                    <img src={url} alt="" className="w-full h-full object-contain" />
                    {showOverlay && <span className="absolute inset-0 bg-black/55 flex items-center justify-center text-white text-sm font-bold gap-1.5">
                        <Camera className="w-4 h-4" /> Ver todas las fotos
                      </span>}
                  </button>;
              })}
            </div>}
        <Badge className="absolute top-4 right-4" variant="good">{OPERATION_TYPE_LABEL[property.operationType]}</Badge>
      </div>

      {lightboxOpen && <div className="fixed inset-0 z-[2000] bg-black/90 flex flex-col items-center justify-center p-6" onClick={() => setLightboxOpen(false)}>
          <button type="button" onClick={() => setLightboxOpen(false)} aria-label="Cerrar" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            <img src={images[activeImage]} alt="" className="w-full max-h-[75vh] object-contain rounded-lg" />
            {images.length > 1 && <>
                <button type="button" onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)} aria-label="Anterior" className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button type="button" onClick={() => setActiveImage(i => (i + 1) % images.length)} aria-label="Siguiente" className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>}
          </div>
          <p className="text-white/70 text-xs font-mono mt-3">{activeImage + 1} / {images.length}</p>
        </div>}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
        <div className="space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-on-surface">{property.title}</h1>
              <p className="text-sm text-on-surface-variant flex items-center gap-1 mt-1">
                <MapPin className="w-4 h-4" /> {property.address}, {property.neighborhood.name}
              </p>
            </div>
            <FavoriteButton propertyId={property.id} ownerEmail={property.createdByEmail} className="border border-outline-variant" />
          </div>

          <div className="space-y-3 border-y border-outline-variant py-4">
            <span className="block text-2xl font-bold text-primary">{OPERATION_TYPE_LABEL[property.operationType]} {formatPrice(property.price, property.operationType)}</span>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><Building2 className="w-4 h-4" /> {PROPERTY_TYPE_LABEL[property.propertyType]}</span>
              <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><DoorOpen className="w-4 h-4" /> {property.rooms} amb.</span>
              <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><Ruler className="w-4 h-4" /> {formatNumber(property.surfaceM2)} m² {property.totalSurfaceM2 ? "tot." : ""}</span>
              {property.totalSurfaceM2 && <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><Ruler className="w-4 h-4" /> {formatNumber(property.totalSurfaceM2)} m² cub.</span>}
              {property.bathrooms != null && <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><Bath className="w-4 h-4" /> {property.bathrooms} baño{property.bathrooms > 1 ? "s" : ""}</span>}
              {property.ageYears != null && <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><CalendarClock className="w-4 h-4" /> {property.ageYears === 0 ? "A estrenar" : `${property.ageYears} años`}</span>}
              {property.orientation && <span className="flex items-center gap-1.5 text-sm font-mono text-on-surface-variant"><Compass className="w-4 h-4" /> {property.orientation}</span>}
            </div>
          </div>

          {property.description && <div className="space-y-2">
              <h2 className="text-xs font-bold text-outline uppercase tracking-widest">Descripción</h2>
              <p className={cn("text-sm text-on-surface-variant whitespace-pre-line", !descExpanded && "line-clamp-4")}>{property.description}</p>
              {property.description.length > 220 && <button type="button" onClick={() => setDescExpanded(v => !v)} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  {descExpanded ? "Leer menos" : "Leer descripción completa"} <ChevronDown className={cn("w-3 h-3 transition-transform", descExpanded && "rotate-180")} />
                </button>}
            </div>}

          {/* Tasación de Nidio: si ya viene calculada se muestra directo; si
              no, se ofrece calcularla al toque (misma lógica que la
              pantalla de Tasación, pero con los datos de esta propiedad). */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xs font-bold text-outline uppercase tracking-widest flex items-center gap-1.5"><Calculator className="w-3.5 h-3.5" /> Tasación de Nidio</h2>
                {valuationRange && <ValuationBadge result={valuationResult} />}
              </div>
              {valuationRange
                ? <p className="text-sm text-on-surface-variant">
                    Rango estimado: <strong className="text-on-surface">{formatPrice(valuationRange.min, property.operationType)} – {formatPrice(valuationRange.max, property.operationType)}</strong>
                  </p>
                : !user
                  ? <p className="text-sm text-on-surface-variant">
                      <Link to="/auth/login" className="text-primary font-semibold hover:underline">Iniciá sesión</Link> para calcular la tasación de esta propiedad.
                    </p>
                  : <>
                      {valuationError && <p className="text-xs font-semibold text-error">{valuationError}</p>}
                      <Button type="button" size="sm" onClick={handleCalcValuation} disabled={calculatingValuation} className="gap-2">
                        <Calculator className="w-4 h-4" /> {calculatingValuation ? "Calculando…" : "Calcular tasación"}
                      </Button>
                    </>}
            </CardContent>
          </Card>

          {/* Life Score: mismo criterio — si ya tiene uno calculado se
              muestra, si no se ofrece calcularlo con ponderación neutral. */}
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-xs font-bold text-outline uppercase tracking-widest flex items-center gap-1.5"><HeartPulse className="w-3.5 h-3.5" /> Life Score</h2>
                {lifeScoreValue != null && <span className="text-xl font-bold text-primary">{Math.round(lifeScoreValue)}/100</span>}
              </div>
              {lifeScoreValue == null && (!user
                ? <p className="text-sm text-on-surface-variant">
                    <Link to="/auth/login" className="text-primary font-semibold hover:underline">Iniciá sesión</Link> para calcular el Life Score de esta propiedad.
                  </p>
                : <>
                    {lifeScoreError && <p className="text-xs font-semibold text-error">{lifeScoreError}</p>}
                    <Button type="button" size="sm" onClick={handleCalcLifeScore} disabled={calculatingLifeScore} className="gap-2">
                      <HeartPulse className="w-4 h-4" /> {calculatingLifeScore ? "Calculando…" : "Calcular Life Score"}
                    </Button>
                    <p className="text-xs text-on-surface-variant italic">
                      Se calcula con ponderación neutral entre las 7 categorías. Para personalizar tus prioridades, usá{" "}
                      <Link to="/life-score" className="text-primary font-semibold hover:underline">Life Score</Link>.
                    </p>
                  </>)}
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h2 className="text-xs font-bold text-outline uppercase tracking-widest">Ubicación</h2>
            <div className="h-64 rounded-xl overflow-hidden border border-outline-variant">
              <MapContainer center={[property.location.lat, property.location.lon]} zoom={15} scrollWheelZoom={false} className="w-full h-full">
                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                <Marker position={[property.location.lat, property.location.lon]} icon={LOCATION_PIN_ICON} />
              </MapContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                {property.createdByName && <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center text-sm font-bold shrink-0">
                    {property.createdByName.charAt(0).toUpperCase()}
                  </div>}
                <h2 className="font-bold text-on-surface">{property.createdByName ? `Contactá a ${property.createdByName}` : "Contacto"}</h2>
              </div>
              {!property.createdByName
                ? <p className="text-sm text-on-surface-variant">
                    Esta propiedad es parte del catálogo sintético de demostración de Nidio: no tiene un publicador real para contactar.
                  </p>
                : isOwner
                  ? <p className="text-sm text-on-surface-variant">
                      Esta es tu propia publicación, no podés contactarte a vos misma. Podés gestionarla desde{" "}
                      <Link to="/mis-publicaciones" className="text-primary font-semibold hover:underline">Mis publicaciones</Link>.
                    </p>
                  : isProfessional
                    ? <p className="text-sm text-on-surface-variant">
                        Las cuentas profesionales no contactan publicadores desde Nidio. Para gestionar tus propias consultas, usá tu email de contacto habitual.
                      </p>
                    : !user
                    ? <p className="text-sm text-on-surface-variant">
                        <Link to="/auth/login" className="text-primary font-semibold hover:underline">Iniciá sesión</Link> para contactar al publicador.
                      </p>
                    : sent
                      ? <p className="text-sm text-good-value font-semibold flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Mensaje enviado. Te va a responder por mail.</p>
                      : <form onSubmit={handleContact} className="space-y-3" noValidate>
                        {contactError && <p className="text-xs font-semibold text-error">{contactError}</p>}

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-xs text-on-surface-variant">Nombre</label>
                            <input value={contactName} onChange={e => setContactName(e.target.value)} className={cn("w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary", contactFieldErrors.contactName && INVALID_CLASS)} />
                            {contactFieldErrors.contactName && <p className="text-xs font-semibold text-error">Obligatorio</p>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-on-surface-variant">Email</label>
                            <input disabled value={user.email ?? ""} className="w-full rounded-md border border-outline-variant bg-surface-container-low px-3 py-2 text-sm text-on-surface disabled:opacity-70" />
                          </div>
                        </div>

                        <div className="grid grid-cols-[100px_1fr] gap-3">
                          <div className="space-y-1 relative" ref={countryRef}>
                            <label className="text-xs text-on-surface-variant">País</label>
                            <button
                              type="button"
                              onClick={() => setCountryOpen(o => !o)}
                              className="w-full flex items-center justify-between gap-1 rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary"
                            >
                              <span>{countryCode}</span>
                              <ChevronDown className="w-3.5 h-3.5 text-on-surface-variant shrink-0" />
                            </button>
                            {countryOpen && <div className="absolute z-20 top-full mt-1 w-60 rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg">
                                <input
                                  autoFocus
                                  value={countryQuery}
                                  onChange={e => setCountryQuery(e.target.value)}
                                  placeholder="Buscar país…"
                                  className="w-full px-3 py-2 text-sm border-b border-outline-variant outline-none bg-transparent text-on-surface"
                                />
                                <div className="max-h-56 overflow-y-auto">
                                  {COUNTRY_CODES.filter(({ name, dial }) => `${name} ${dial}`.toLowerCase().includes(countryQuery.trim().toLowerCase())).map(({ name, dial }) => <button
                                      key={`${name}-${dial}`}
                                      type="button"
                                      onClick={() => { setCountryCode(dial); setCountryOpen(false); setCountryQuery(""); }}
                                      className={cn("w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-sm hover:bg-surface-container transition-colors", dial === countryCode && "bg-surface-container font-semibold")}
                                    >
                                      <span className="text-on-surface">{name}</span>
                                      <span className="text-on-surface-variant shrink-0">{dial}</span>
                                    </button>)}
                                </div>
                              </div>}
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs text-on-surface-variant">Teléfono</label>
                            <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="Ej: 11 5555-5555" className={cn("w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary", contactFieldErrors.contactPhone && INVALID_CLASS)} />
                            {contactFieldErrors.contactPhone && <p className="text-xs font-semibold text-error">Obligatorio</p>}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs text-on-surface-variant">Mensaje</label>
                          <textarea rows={4} value={message} onChange={e => setMessage(e.target.value)} className={cn("w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary resize-none", contactFieldErrors.message && INVALID_CLASS)} />
                          {contactFieldErrors.message && <p className="text-xs font-semibold text-error">Obligatorio</p>}
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs text-on-surface-variant">Preguntas frecuentes</label>
                          <div className="flex flex-wrap gap-2">
                            {QUICK_QUESTIONS.map(q => <button key={q} type="button" onClick={() => setMessage(q)} className="text-xs font-semibold px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
                                {q}
                              </button>)}
                          </div>
                        </div>

                        <label className="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer">
                          <input type="checkbox" required checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-0.5 accent-primary" />
                          Acepto los <Link to="/terminos" target="_blank" className="text-primary font-semibold hover:underline">Términos y Condiciones de Uso</Link>.
                        </label>
                        <label className="flex items-start gap-2 text-xs text-on-surface-variant cursor-pointer">
                          <input type="checkbox" required checked={privacyAccepted} onChange={e => setPrivacyAccepted(e.target.checked)} className="mt-0.5 accent-primary" />
                          Acepto la <Link to="/privacidad" target="_blank" className="text-primary font-semibold hover:underline">Política de Privacidad</Link>.
                        </label>

                        <Button type="submit" className="w-full gap-2" disabled={sending || !termsAccepted || !privacyAccepted}>
                          <Mail className="w-4 h-4" /> {sending ? "Enviando…" : "Contactar"}
                        </Button>
                      </form>}
            </CardContent>
          </Card>

          {/* Cartel de tipo de publicador (inmobiliaria vs. dueño directo)
              con nombre, teléfono y mail de contacto directo — debajo del
              formulario, igual criterio que los portales de referencia. */}
          {property.createdByName && <Card>
              <CardContent className="p-5 space-y-3">
                <p className="text-sm font-bold text-on-surface">Publicado por {PUBLISHER_TYPE_LABEL[property.publisherType] ?? "Dueño directo"}</p>
                <div className="flex items-start justify-between gap-3 border-t border-outline-variant pt-3">
                  <div className="space-y-1.5">
                    <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                      {/* Ya dice "Publicado por Inmobiliaria" arriba, así que acá
                          no hace falta repetir la palabra "Inmobiliaria" antes
                          del nombre propio de la cuenta. */}
                      {property.publisherType === "AGENCY" ? property.createdByName.replace(/^inmobiliaria\s+/i, "") : property.createdByName}
                      {/* Check de "cuenta verificada": solo para inmobiliarias
                          (cuenta profesional), no para dueños directos. */}
                      {property.publisherType === "AGENCY" && <BadgeCheck className="w-4 h-4 text-primary shrink-0" aria-label="Cuenta verificada" />}
                    </p>
                    {property.createdByPhone && <a href={`tel:${property.createdByPhone}`} className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
                        <Phone className="w-3.5 h-3.5" /> {property.createdByPhone}
                      </a>}
                    {property.createdByEmail && <a href={`mailto:${property.createdByEmail}`} className="flex items-center gap-1.5 text-xs text-on-surface-variant hover:text-primary transition-colors">
                        <Mail className="w-3.5 h-3.5" /> {property.createdByEmail}
                      </a>}
                  </div>
                  {/* Logo (o ícono genérico) al costado derecho del bloque de
                      nombre/tel/mail, no arriba junto al "Publicado por". */}
                  {property.publisherType === "AGENCY" && property.createdByLogoUrl
                    ? <img src={property.createdByLogoUrl} alt={`Logo de ${property.createdByName}`} className="w-9 h-9 rounded-full object-cover shrink-0 border border-outline-variant" />
                    : <div className="w-9 h-9 rounded-full bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                        {property.publisherType === "AGENCY" ? <Building className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                      </div>}
                </div>
              </CardContent>
            </Card>}
        </div>
      </div>
    </div>;
}
