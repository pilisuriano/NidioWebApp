import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Calculator, CheckCircle2, AlertCircle, AlertTriangle, Info, ArrowLeft, TrendingUp, TrendingDown } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { useUsage, isQuotaExceeded } from "@/lib/usage";
import { QuotaNotice } from "@/components/ui/QuotaNotice";
import { formatNumber } from "@/lib/format";
import { parseExplanation, markMissing } from "@/lib/explanation";
import { RangeBar } from "@/components/valuation/RangeBar";
import { FactorBars } from "@/components/valuation/FactorBars";
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
// Aviso para PH y casas (ver devolución del 50%): se muestra al elegir el
// tipo en el formulario y también junto al resultado.
const LOW_PRECISION_TEXT = "La estimación para PH y casas es menos precisa, ya que el modelo cuenta con menos datos de estos tipos de propiedad.";
function LowPrecisionNotice() {
  return <p className="flex items-start gap-2 rounded-md border border-secondary/30 bg-secondary/5 p-2.5 text-xs text-on-surface-variant" role="note">
      <Info className="w-4 h-4 shrink-0 mt-0.5 text-secondary" />
      <span>{LOW_PRECISION_TEXT}</span>
    </p>;
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
        blueRateUsed: operationType === "RENT" ? blueRate : null,
        propertyType,
        // Datos opcionales que quedaron vacíos (ver markMissing en lib/explanation.js).
        missing: { totalSurface: !totalSurfaceM2, bathrooms: !bathrooms, expenses: !expensesUsd, condition: !propertyCondition }
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
  // Explicación del modelo separada en partes (ver lib/explanation.js). El
  // "valor estimado sugerido" es la predicción central del modelo (la misma que
  // menciona la explicación); el rango NO es simétrico alrededor de ella, así
  // que el punto medio del rango solo se usa si la explicación no la trae.
  const explanation = result ? parseExplanation(result.explanationText) : null;
  const estimatedMid = result ? (explanation?.centralPrediction ?? (result.estimatedMin + result.estimatedMax) / 2) : 0;
  const priceM2 = result && lastRequest && lastRequest.surfaceM2 > 0 ? estimatedMid / lastRequest.surfaceM2 : null;
  const showArs = lastRequest?.operationType === "RENT" && !!lastRequest?.blueRateUsed;
  const toArs = usd => usd * (lastRequest?.blueRateUsed ?? 0);
  // Montos del resultado con su moneda (en alquiler se muestra en ARS, con el equivalente en USD aparte).
  const fmtMoney = usd => `${showArs ? "ARS" : currency} ${formatNumber(showArs ? toArs(usd) : usd)}`;
  const rangeM2 = result && lastRequest && lastRequest.surfaceM2 > 0 ? [result.estimatedMin / lastRequest.surfaceM2, result.estimatedMax / lastRequest.surfaceM2] : null;
  const halfWidthPct = result && estimatedMid > 0 ? Math.round(((result.estimatedMax - result.estimatedMin) / 2 / estimatedMid) * 100) : null;
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

      {/* Cuota mensual (3 gratis por mes, 6 para cuentas profesionales), arriba de todo para que se note. */}
      <QuotaNotice feature="valuation" status={usage} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form */}
        <div className="lg:col-span-5">
          {/* h-full: el formulario y el resultado miden siempre lo mismo (el más alto de los dos); el botón queda al pie. */}
          <Card className="h-full flex flex-col">
            <CardContent className="p-5 flex-1">
              <form onSubmit={handleSubmit} className="h-full flex flex-col gap-4">
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
                  {/* Devolución del 50%: el modelo se entrenó con muchos menos
                      avisos de PH y casas que de departamentos, así que el
                      rango es menos preciso para esos tipos. */}
                  {propertyType !== "APARTMENT" && <LowPrecisionNotice />}
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

                <div className="mt-auto pt-2">
                  <Button type="submit" disabled={submitting || !neighborhoodId || quotaBlocked} className="w-full h-12 text-base gap-2 disabled:opacity-60">
                    <Calculator className="w-5 h-5" />
                    {submitting ? "Calculando…" : "Calcular valuación"}
                  </Button>
                </div>
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

                  {/* El rango es el resultado principal (el modelo da un rango, no un
                      valor exacto), por eso va grande; el valor sugerido va marcado en
                      la barra de abajo. */}
                  <div className="mb-6 rounded-xl border border-primary/15 bg-gradient-to-b from-primary/5 to-transparent px-4 py-6 text-center">
                    <p className="text-xs font-bold text-outline uppercase tracking-widest mb-2">RANGO ESTIMADO</p>
                    <div className="flex flex-wrap items-baseline justify-center gap-x-2 gap-y-1">
                      <span className="text-lg sm:text-xl font-bold text-on-surface-variant">{showArs ? "ARS" : currency}</span>
                      <span className="text-3xl sm:text-5xl font-bold text-primary tracking-tighter">
                        {formatNumber(showArs ? toArs(result.estimatedMin) : result.estimatedMin)}
                        <span className="text-on-surface-variant font-normal mx-1 sm:mx-2">–</span>
                        {formatNumber(showArs ? toArs(result.estimatedMax) : result.estimatedMax)}
                      </span>
                    </div>
                    {showArs && <p className="text-xs text-on-surface-variant mt-1">
                        ≈ {currency} {formatNumber(result.estimatedMin)} – {formatNumber(result.estimatedMax)}
                        {" "}(dólar blue del momento del cálculo: ${formatNumber(lastRequest.blueRateUsed)})
                      </p>}
                    <p className="mt-3 text-[11px] text-on-surface-variant">
                      El rango apunta a contener el precio de mercado en unas 8 de cada 10 propiedades parecidas.
                    </p>
                  </div>

                  {lastRequest && lastRequest.propertyType !== "APARTMENT" && <div className="mb-6"><LowPrecisionNotice /></div>}

                  {/* Barra de rango: extremos, valor sugerido y, si lo cargó, el precio del usuario */}
                  <div className="mb-6">
                    <RangeBar
                      min={result.estimatedMin}
                      max={result.estimatedMax}
                      suggested={estimatedMid}
                      declared={lastRequest?.declaredPrice ?? null}
                      declaredLabel={lastRequest?.declaredPriceInput != null ? `Tu precio: ${lastRequest.operationType === "RENT" ? "ARS" : "USD"} ${formatNumber(lastRequest.declaredPriceInput)}` : undefined}
                      format={fmtMoney}
                    />
                  </div>

                  {/* Datos derivados (los extremos ya están en la barra, no se repiten) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-6">
                    <div className="border border-outline-variant rounded-lg p-3 sm:p-4 bg-surface-container-low/50 space-y-1 min-w-0">
                      <p className="text-xs text-on-surface-variant">Precio por m² sugerido</p>
                      <p className="text-lg font-bold text-on-surface break-words">{priceM2 != null ? formatNumber(priceM2) : "—"}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant">{currency}/m²</p>
                    </div>
                    <div className="border border-outline-variant rounded-lg p-3 sm:p-4 bg-surface-container-low/50 space-y-1 min-w-0">
                      <p className="text-xs text-on-surface-variant">Rango por m²</p>
                      <p className="text-lg font-bold text-on-surface break-words">
                        {rangeM2 ? `${formatNumber(rangeM2[0])} – ${formatNumber(rangeM2[1])}` : "—"}
                      </p>
                      <p className="text-[10px] font-mono text-on-surface-variant">{currency}/m²</p>
                    </div>
                    <div className="border border-outline-variant rounded-lg p-3 sm:p-4 bg-surface-container-low/50 space-y-1 min-w-0">
                      <p className="text-xs text-on-surface-variant">Amplitud del rango</p>
                      <p className="text-lg font-bold text-on-surface">{halfWidthPct != null ? `± ${halfWidthPct} %` : "—"}</p>
                      <p className="text-[10px] font-mono text-on-surface-variant">alrededor del valor sugerido</p>
                    </div>
                  </div>

                  {/* Explicación del modelo (SHAP) -- viene lista en español desde
                      el backend (ValuationResponse.explanationText, ver
                      MlServiceClient.PredictResponse) -- puede venir null si el
                      backend no llegó a calcularla, así que no se muestra nada en
                      ese caso, en vez de un bloque vacío. */}
                  {result.explanationText && <div className="border border-outline-variant rounded-lg p-4 sm:p-5 bg-surface-container-low/50 space-y-4">
                      <p className="text-xs font-bold text-outline uppercase tracking-widest flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" /> ¿Por qué este rango?
                      </p>
                      {explanation.mainFactor && <p className="text-sm text-on-surface-variant">
                          Lo que más pesa en esta estimación es <strong className="text-on-surface">{markMissing(explanation.mainFactor, lastRequest?.missing)}</strong>, que {explanation.mainFactorUp ? "sube" : "baja"} el precio.
                        </p>}
                      {result.explanation?.length > 0 && <FactorBars factors={result.explanation} operationType={lastRequest?.operationType} rate={lastRequest?.blueRateUsed ?? null} missing={lastRequest?.missing} />}
                      {!(result.explanation?.length > 0) && (explanation.up.length > 0 || explanation.down.length > 0) && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {explanation.up.length > 0 && <div className="space-y-2">
                              <p className="text-xs font-bold text-tertiary flex items-center gap-1.5"><TrendingUp className="w-4 h-4" /> Suben el precio</p>
                              <ul className="flex flex-wrap gap-1.5">
                                {explanation.up.map(f => <li key={f} className="text-xs px-2.5 py-1 rounded-full bg-tertiary/10 text-tertiary font-semibold">{markMissing(f, lastRequest?.missing)}</li>)}
                              </ul>
                            </div>}
                          {explanation.down.length > 0 && <div className="space-y-2">
                              <p className="text-xs font-bold text-alert-price flex items-center gap-1.5"><TrendingDown className="w-4 h-4" /> Bajan el precio</p>
                              <ul className="flex flex-wrap gap-1.5">
                                {explanation.down.map(f => <li key={f} className="text-xs px-2.5 py-1 rounded-full bg-alert-price/10 text-alert-price font-semibold">{markMissing(f, lastRequest?.missing)}</li>)}
                              </ul>
                            </div>}
                        </div>}
                      {[...explanation.priceNotes, ...explanation.other].length > 0 && <p className="text-xs text-on-surface-variant">
                          {[...explanation.priceNotes, ...explanation.other].join(" ")}
                        </p>}
                    </div>}
                </>}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
}
