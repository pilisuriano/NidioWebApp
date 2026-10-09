import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Calculator, CheckCircle2, AlertCircle, AlertTriangle, Info, ArrowLeft } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useUsage, isQuotaExceeded } from "@/lib/usage";
import { QuotaNotice } from "@/components/ui/QuotaNotice";
import { formatNumber } from "@/lib/format";
import { useBlueRate } from "@/lib/blueRate";
import { cn } from "@/lib/utils";
const PROPERTY_TYPES = [{
  value: "APARTMENT",
  label: "Departamento"
}, {
  value: "HOUSE",
  label: "Casa"
}, {
  value: "PH",
  label: "PH"
}];
// Mismos 4 valores que espera el backend/modelo (ver ValuationCreateRequest.java y
// valuation.py::_CONDITION_MAP) -- "" (no especifica) no se manda, queda en null.
const PROPERTY_CONDITIONS = [{
  value: "",
  label: "No especifica"
}, {
  value: "NEW",
  label: "A estrenar"
}, {
  value: "USED_GOOD_CONDITION",
  label: "Usado, buen estado"
}, {
  value: "NEEDS_RENOVATION",
  label: "A reciclar"
}];
// Características opcionales -- ninguna es obligatoria, pero el modelo SÍ las usa
// (via SHAP) cuando están disponibles y da una estimación más ajustada (ver
// bitácora del modelo: cochera/amenities mueven la predicción varias decenas de
// USD). Nombres de campo en camelCase, iguales a ValuationCreateRequest.java.
const AMENITY_SWITCHES = [{
  field: "hasPool",
  label: "Pileta"
}, {
  field: "hasGarage",
  label: "Cochera"
}, {
  field: "buildingAmenities",
  label: "Amenities del edificio"
}, {
  field: "security24h",
  label: "Seguridad 24hs"
}, {
  field: "bright",
  label: "Luminoso"
}, {
  field: "aptoCredito",
  label: "Apto crédito"
}, {
  field: "furnished",
  label: "Amoblado"
}];
// Cotización pública del dólar blue (ver dolarapi.com, useBlueRate en
// lib/blueRate.js) -- se usa SOLO del lado del frontend, para 2 cosas
// puntuales, ninguna de las cuales toca el backend/ml-service (que siguen
// trabajando 100% en USD, sin excepciones, ver bitácora 6.41 adendum):
//   1. Convertir a USD el "precio publicado" que el usuario carga en ARS para
//      alquiler (más natural que pedirle el precio en dólares para un alquiler).
//   2. Mostrar, además del rango en USD (el valor real que devuelve el modelo),
//      un equivalente aproximado en ARS para alquiler (pedido explícito de Pili).
// Si la cotización no se pudo obtener, se deshabilita la carga de precio publicado
// en alquiler (no se puede convertir) y no se muestra el equivalente en ARS -- se seguí
// pudiendo usar el resto del formulario en USD/sin precio publicado sin problema.
function ResultBadge({
  result
}) {
  if (result === "FAIR") {
    return <Badge variant="good" className="px-3 py-1.5 gap-1.5 text-sm border border-good-value/20 bg-good-value/5">
        <CheckCircle2 className="w-4 h-4" /> DENTRO DEL RANGO
      </Badge>;
  }
  if (result === "OVERVALUED") {
    return <Badge variant="alert" className="px-3 py-1.5 gap-1.5 text-sm">
        <AlertTriangle className="w-4 h-4" /> SOBRE EL RANGO
      </Badge>;
  }
  if (result === "UNDERVALUED") {
    return <Badge variant="secondary" className="px-3 py-1.5 gap-1.5 text-sm bg-secondary/10 text-secondary border border-secondary/20">
        <Info className="w-4 h-4" /> BAJO EL RANGO
      </Badge>;
  }
  return null;
}
export default function Valuacion() {
  const { status: usage, blocked: quotaBlocked, refresh: refreshUsage } = useUsage("valuation");
  const [searchParams] = useSearchParams();
  // Llegando desde "Publicar" (link "¿No sabés qué precio poner?"): se
  // precarga con lo que ya había cargado en el aviso, y se muestra un link
  // para volver ahí sin perder esos datos (quedaron guardados en sessionStorage).
  const fromPublicar = searchParams.get("from") === "publicar";
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [operationType, setOperationType] = useState(searchParams.get("operationType") ?? "SALE");
  const [propertyType, setPropertyType] = useState(searchParams.get("propertyType") ?? "APARTMENT");
  const [neighborhoodId, setNeighborhoodId] = useState(searchParams.get("neighborhoodId") ?? "");
  const [surfaceM2, setSurfaceM2] = useState(searchParams.get("surfaceM2") ?? "");
  const [rooms, setRooms] = useState(Number(searchParams.get("rooms")) || 2);
  const [declaredPrice, setDeclaredPrice] = useState("");
  // Características opcionales (ver AMENITY_SWITCHES/PROPERTY_CONDITIONS arriba).
  const [totalSurfaceM2, setTotalSurfaceM2] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [propertyCondition, setPropertyCondition] = useState("");
  const [expensesUsd, setExpensesUsd] = useState("");
  const [amenities, setAmenities] = useState({
    hasPool: false,
    hasGarage: false,
    buildingAmenities: false,
    security24h: false,
    bright: false,
    aptoCredito: false,
    furnished: false
  });
  const toggleAmenity = field => setAmenities(prev => ({
    ...prev,
    [field]: !prev[field]
  }));
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  // Se recuerda con qué parámetros se calculó el resultado que se muestra.
  const [lastRequest, setLastRequest] = useState(null);
  // Cotización dólar blue -- null mientras carga o si falló (ver lib/blueRate.js).
  const { blueRate, blueRateError } = useBlueRate();
  useEffect(() => {
    api.get("/api/neighborhoods").then(res => {
      setNeighborhoods(res.data);
      if (!neighborhoodId && res.data.length > 0) setNeighborhoodId(String(res.data[0].id));
    }).catch(() => setError("No se pudieron cargar los barrios"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    // El precio publicado para ALQUILER se carga en ARS (lo más natural para
    // alguien buscando en Argentina), pero el backend/modelo trabajan siempre
    // en USD, sin excepciones (ver bitácora 6.41 adendum) -- se convierte acá,
    // del lado del cliente, con la cotización del dólar blue. El backend nunca
    // recibe ni calcula nada en ARS.
    let declaredUsd = null;
    if (declaredPrice) {
      const raw = Number(declaredPrice);
      if (operationType === "RENT") {
        if (!blueRate) {
          setError("No se pudo obtener la cotización del dólar para convertir el precio publicado. Probá de nuevo en un momento, o dejá ese campo vacío.");
          return;
        }
        declaredUsd = raw / blueRate;
      } else {
        declaredUsd = raw;
      }
    }
    setSubmitting(true);
    try {
      const res = await api.post("/api/valuations", {
        operationType,
        propertyType,
        neighborhoodId: Number(neighborhoodId),
        surfaceM2: Number(surfaceM2),
        rooms,
        declaredPrice: declaredUsd,
        totalSurfaceM2: totalSurfaceM2 ? Number(totalSurfaceM2) : null,
        bathrooms: bathrooms ? Number(bathrooms) : null,
        propertyCondition: propertyCondition || null,
        expensesUsd: expensesUsd ? Number(expensesUsd) : null,
        ...amenities
      });
      setResult(res.data);
      refreshUsage();
      setLastRequest({
        operationType,
        // Precio tal cual lo tipeó el usuario (ARS para alquiler, USD para venta) --
        // se usa solo para mostrarle "Tu precio" con la unidad que él cargó.
        declaredPriceInput: declaredPrice ? Number(declaredPrice) : null,
        // Mismo precio ya convertido a USD -- es lo que se compara contra el
        // rango estimado (que también viene siempre en USD del backend).
        declaredPrice: declaredUsd,
        neighborhoodName: neighborhoods.find(n => String(n.id) === neighborhoodId)?.name ?? "",
        surfaceM2: Number(surfaceM2),
        // Cotización usada en ESTE cálculo puntual, para que el equivalente en
        // ARS que se muestra abajo no cambie solo si blueRate se actualiza
        // mientras el usuario sigue mirando un resultado ya calculado.
        blueRateUsed: operationType === "RENT" ? blueRate : null
      });
    } catch (err) {
      // Sin usos gratis este mes (429): el cartel de QuotaNotice ya lo explica
      // con la invitación al plan pago, no hace falta repetirlo como error.
      if (isQuotaExceeded(err)) {
        refreshUsage();
        return;
      }
      setError(apiErrorMessage(err, "No se pudo calcular la valuación"));
    } finally {
      setSubmitting(false);
    }
  }
  // El backend/modelo devuelven TODO en USD, venta y alquiler por igual (ver
  // bitácora 6.41 adendum) -- el equivalente en ARS de más abajo es puramente
  // decorativo, nunca reemplaza al valor real en USD.
  const currency = "USD" + (lastRequest?.operationType === "RENT" ? "/mes" : "");
  const estimatedMid = result ? (result.estimatedMin + result.estimatedMax) / 2 : 0;
  const priceM2 = result && lastRequest && lastRequest.surfaceM2 > 0 ? estimatedMid / lastRequest.surfaceM2 : null;
  const showArs = lastRequest?.operationType === "RENT" && !!lastRequest?.blueRateUsed;
  const toArs = usd => usd * (lastRequest?.blueRateUsed ?? 0);
  // Posición del precio declarado dentro de la barra (25%-75% representa el rango estimado).
  let declaredPct = null;
  if (result && lastRequest?.declaredPrice != null) {
    const span = result.estimatedMax - result.estimatedMin || 1;
    const t = (lastRequest.declaredPrice - result.estimatedMin) / span;
    declaredPct = Math.max(2, Math.min(98, 25 + t * 50));
  }
  return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {fromPublicar && <Link to="/publicar" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
          <ArrowLeft className="w-4 h-4" /> Volver a publicar
        </Link>}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold text-on-surface">Tasación</h1>
        <p className="text-on-surface-variant max-w-2xl">
          Estimá el rango de valor de mercado de una propiedad en CABA. El resultado es un rango, no un valor exacto.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5">
          <Card>
            <CardContent className="p-5 space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Operación */}
                <div className="flex rounded-md border border-outline-variant p-1 bg-surface-container-low">
                  {["SALE", "RENT"].map(op => <button key={op} type="button" onClick={() => setOperationType(op)} className={cn("flex-1 rounded text-sm py-2 transition-all", operationType === op ? "font-bold bg-primary text-on-primary shadow-sm" : "font-medium text-on-surface-variant hover:text-on-surface")}>
                      {op === "SALE" ? "Compra" : "Alquiler"}
                    </button>)}
                </div>

                {/* Tipo */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest">TIPO DE PROPIEDAD</label>
                  <div className="flex gap-2">
                    {PROPERTY_TYPES.map(t => <button key={t.value} type="button" onClick={() => setPropertyType(t.value)} className={cn("flex-1 min-w-0 px-1 text-xs sm:text-sm py-2 rounded-md transition-all", propertyType === t.value ? "border-2 border-primary bg-primary/5 text-primary font-bold" : "border border-outline-variant hover:border-outline text-on-surface-variant font-medium")}>
                        {t.label}
                      </button>)}
                  </div>
                </div>

                {/* Barrio */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="barrio">
                    BARRIO (CABA)
                  </label>
                  <select id="barrio" value={neighborhoodId} onChange={e => setNeighborhoodId(e.target.value)} required className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary">
                    {neighborhoods.map(n => <option key={n.id} value={n.id}>
                        {n.name}
                      </option>)}
                  </select>
                </div>

                {/* Superficie y ambientes */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="surface">
                      SUPERFICIE CUBIERTA (M²)
                    </label>
                    <Input id="surface" placeholder="Ej: 45" type="number" min={10} required value={surfaceM2} onChange={e => setSurfaceM2(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-widest">AMBIENTES</label>
                    <div className="flex border border-outline-variant rounded-md overflow-hidden bg-surface-container-lowest h-10">
                      <button type="button" onClick={() => setRooms(Math.max(1, rooms - 1))} className="px-3 hover:bg-surface-container transition-colors border-r border-outline-variant">
                        -
                      </button>
                      <input type="text" value={rooms} readOnly className="w-full text-center font-bold text-sm bg-transparent outline-none" />
                      <button type="button" onClick={() => setRooms(Math.min(8, rooms + 1))} className="px-3 hover:bg-surface-container transition-colors border-l border-outline-variant">
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Precio declarado */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="declared">
                    PRECIO PUBLICADO (OPCIONAL)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-on-surface-variant">
                      {operationType === "SALE" ? "USD" : "ARS"}
                    </span>
                    <Input id="declared" placeholder="Ingresa el precio para comparar" className="pl-12" type="number" min={0} value={declaredPrice} onChange={e => setDeclaredPrice(e.target.value)} disabled={operationType === "RENT" && blueRateError} />
                  </div>
                  <p className="text-xs text-on-surface-variant italic">
                    Permite detectar sobre/subvaluaciones contra el rango estimado.
                    {operationType === "RENT" && (blueRateError ? " No se pudo obtener la cotización del dólar en este momento -- este campo queda deshabilitado hasta que se pueda convertir a USD." : blueRate ? ` Se convierte a USD con la cotización blue actual (1 USD ≈ $${formatNumber(blueRate)}).` : " Obteniendo cotización del dólar…")}
                  </p>
                </div>

                {/* Características opcionales -- no son obligatorias, pero el modelo
                    las aprovecha (SHAP) para un rango más ajustado. */}
                <div className="space-y-2 pt-2 border-t border-outline-variant">
                  <p className="text-xs font-bold text-outline uppercase tracking-widest pt-3">
                    Características adicionales (opcional)
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="totalSurface">
                        SUPERFICIE TOTAL (M²)
                      </label>
                      <Input id="totalSurface" placeholder="Ej: 50" type="number" min={0} value={totalSurfaceM2} onChange={e => setTotalSurfaceM2(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="bathrooms">
                        BAÑOS
                      </label>
                      <Input id="bathrooms" placeholder="Ej: 1" type="number" min={0} value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="condition">
                        ESTADO
                      </label>
                      <select id="condition" value={propertyCondition} onChange={e => setPropertyCondition(e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary">
                        {PROPERTY_CONDITIONS.map(c => <option key={c.value} value={c.value}>
                            {c.label}
                          </option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="expenses">
                        EXPENSAS (USD)
                      </label>
                      <Input id="expenses" placeholder="Ej: 120" type="number" min={0} value={expensesUsd} onChange={e => setExpensesUsd(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {AMENITY_SWITCHES.map(({
                    field,
                    label
                  }) => <Switch key={field} checked={amenities[field]} onCheckedChange={() => toggleAmenity(field)} label={label} />)}
                  </div>
                </div>

                {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>}

                {/* Cuota gratuita mensual (3 por mes, 6 para cuentas profesionales). */}
                <QuotaNotice feature="valuation" status={usage} />
                <Button type="submit" disabled={submitting || !neighborhoodId || quotaBlocked} className="w-full h-12 text-base gap-2 disabled:opacity-60">
                  <Calculator className="w-5 h-5" />
                  {submitting ? "Calculando…" : "Calcular valuación"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Result */}
        <div className="lg:col-span-7">
          <Card className="h-full flex flex-col">
            <CardContent className="p-6 flex-1 flex flex-col">
              {!result ? <div className="flex-1 flex flex-col items-center justify-center text-center text-on-surface-variant gap-4 py-10">
                  <Calculator className="w-16 h-16 text-surface-dim" />
                  <p className="font-mono text-sm max-w-xs">
                    Completá el formulario y calculá una valuación para ver el rango estimado acá.
                  </p>
                </div> : <>
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-xs font-bold text-outline uppercase tracking-widest mb-1">RESULTADO DEL ANÁLISIS</h3>
                      <h2 className="text-2xl font-bold text-on-surface">
                        {lastRequest?.neighborhoodName} · {formatNumber(lastRequest?.surfaceM2 ?? 0)} m²
                      </h2>
                    </div>
                    <ResultBadge result={result.result} />
                  </div>

                  <div className="text-center mb-6">
                    <p className="text-xs font-bold text-outline uppercase tracking-widest mb-2">VALOR ESTIMADO SUGERIDO</p>
                    {showArs ? <>
                        <div className="flex items-start justify-center gap-2">
                          <span className="text-xl font-bold text-on-surface-variant mt-2">ARS</span>
                          <span className="text-6xl font-bold text-on-surface tracking-tighter">{formatNumber(toArs(estimatedMid))}</span>
                        </div>
                        <p className="text-sm text-on-surface-variant mt-2">
                          ≈ {currency} {formatNumber(estimatedMid)} (cotización dólar blue del momento del cálculo: ${formatNumber(lastRequest.blueRateUsed)})
                        </p>
                      </> : <div className="flex items-start justify-center gap-2">
                        <span className="text-xl font-bold text-on-surface-variant mt-2">{currency}</span>
                        <span className="text-6xl font-bold text-on-surface tracking-tighter">{formatNumber(estimatedMid)}</span>
                      </div>}
                  </div>

                  {/* Barra de rango */}
                  <div className="mb-6 px-4">
                    {/* Frame de posicionamiento único: tanto el tooltip como la línea
                        marcadora se calculan sobre ESTE div (mismo ancho que la barra
                        de colores), y no sobre el div externo con padding -- si el
                        tooltip usara el externo (más ancho, por el px-4) y la línea el
                        interno, un mismo declaredPct% cae en dos posiciones absolutas
                        distintas y quedan desalineados entre sí (hasta ~16px cerca de
                        los bordes, 0 en el centro). */}
                    <div className="relative">
                      {declaredPct != null && lastRequest?.declaredPriceInput != null && <div className="absolute -top-8 transform -translate-x-1/2 bg-inverse-surface text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap" style={{
                    left: `${declaredPct}%`
                  }}>
                          Tu precio: {lastRequest.operationType === "RENT" ? "ARS" : "USD"} {formatNumber(lastRequest.declaredPriceInput)}
                          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-inverse-surface"></div>
                        </div>}

                      <div className="h-4 flex rounded-full overflow-hidden mb-2">
                        <div className="h-full bg-alert-price/30 w-1/4"></div>
                        <div className="h-full bg-primary w-2/4"></div>
                        <div className="h-full bg-alert-price/30 w-1/4"></div>
                      </div>
                      {declaredPct != null && <div className="absolute top-0 h-4 w-1 bg-inverse-surface shadow-[0_0_0_2px_#fff]" style={{
                    left: `${declaredPct}%`
                  }}></div>}
                    </div>
                    <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                      <span>{showArs ? formatNumber(toArs(result.estimatedMin)) : formatNumber(result.estimatedMin)}</span>
                      <span className="font-bold text-primary text-center">RANGO<br />ESTIMADO</span>
                      <span>{showArs ? formatNumber(toArs(result.estimatedMax)) : formatNumber(result.estimatedMax)}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-low/50 space-y-2">
                      <p className="text-xs text-on-surface-variant">Precio x m² (est.)</p>
                      <p className="text-lg font-bold text-on-surface">
                        {priceM2 != null ? formatNumber(priceM2) : "—"}
                      </p>
                      <p className="text-[10px] font-mono text-on-surface-variant">{currency}/m²</p>
                    </div>
                    <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-low/50 space-y-2">
                      <p className="text-xs text-on-surface-variant">Mínimo estimado</p>
                      <p className="text-lg font-bold text-on-surface">{showArs ? formatNumber(toArs(result.estimatedMin)) : formatNumber(result.estimatedMin)}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant">{showArs ? "ARS" : currency}</p>
                      {showArs && <p className="text-[10px] font-mono text-on-surface-variant">≈ {currency} {formatNumber(result.estimatedMin)}</p>}
                    </div>
                    <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-low/50 space-y-2">
                      <p className="text-xs text-on-surface-variant">Máximo estimado</p>
                      <p className="text-lg font-bold text-on-surface">{showArs ? formatNumber(toArs(result.estimatedMax)) : formatNumber(result.estimatedMax)}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant">{showArs ? "ARS" : currency}</p>
                      {showArs && <p className="text-[10px] font-mono text-on-surface-variant">≈ {currency} {formatNumber(result.estimatedMax)}</p>}
                    </div>
                  </div>

                  {/* Explicación del modelo (SHAP) -- viene lista en español desde
                      el backend (ValuationResponse.explanationText, ver
                      MlServiceClient.PredictResponse) -- puede venir null si el
                      backend no llegó a calcularla, así que no se muestra nada en
                      ese caso, en vez de un bloque vacío. */}
                  {result.explanationText && <div className="border border-outline-variant rounded-lg p-4 bg-surface-container-low/50 flex items-start gap-2.5">
                      <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                      <div>
                        <p className="text-xs font-bold text-outline uppercase tracking-widest mb-1">¿Por qué este rango?</p>
                        <p className="text-sm text-on-surface-variant">{result.explanationText}</p>
                      </div>
                    </div>}
                </>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
