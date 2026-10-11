import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { ArrowLeft, ArrowRight, Check, MapPin, Search, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { api, apiErrorMessage } from "@/lib/api";
import { useUsage, isQuotaExceeded } from "@/lib/usage";
import { QuotaNotice } from "@/components/ui/QuotaNotice";
import { useBlueRate } from "@/lib/blueRate";
import { cn } from "@/lib/utils";
import {
  STEP_IDS, REQUIRED_STEPS, OPTIONAL_STEP_IDS, OPERATION_OPTIONS, TYPE_OPTIONS, HOUSEHOLD_OPTIONS, ROOMS_CHOICES, WORK_IMPORTANCE_OPTIONS, DEALBREAKER_OPTIONS,
  NOISE_OPTIONS, OVERPRICED_OPTIONS, PROXIMITY_CATEGORIES, IMPORTANCE_LEVELS, DETAIL_OPTIONS,
  initialAnswers, effectiveMinRooms, shuffle, isStepAnswered, allRequiredAnswered, buildRequest, searchingSteps
} from "@/lib/recommender";
import { Nidi } from "@/components/recommender/Nidi";
import { BudgetSlider } from "@/components/recommender/BudgetSlider";
import { ExpensesSlider } from "@/components/recommender/ExpensesSlider";
import { SearchingScreen } from "@/components/recommender/SearchingScreen";
import { RecommendationResults } from "@/components/recommender/RecommendationResults";

const MIN_SEARCH_MS = 800;

const QUESTIONS = {
  operation: "¿Qué estás buscando?",
  type: "¿Qué tipo de lugar?",
  budget: "¿Cuál es tu presupuesto?",
  household: "¿Con quién vivirás?",
  dealbreaker: "¿Qué te haría descartar una zona de inmediato?",
  noise: "Sobre el ruido de la zona, ¿qué preferís?",
  proximity: "¿Qué querés tener cerca?",
  overpriced: "Si una propiedad está publicada por encima del precio que estima Nidio…",
  details: "¿Hay detalles que sumen?",
  work: "¿Dónde trabajás o estudiás?"
};
const SUGGESTED_FOR_TEXT = {
  SOLO: "desde 1 ambiente",
  COUPLE: "desde 2 ambientes",
  FAMILY: "desde 3 ambientes",
  SHARED: "desde 3 ambientes"
};
const SUBTITLES = {
  budget: "La barra sale de los precios reales del catálogo para lo que elegiste.",
  dealbreaker: "Si hay pocas propiedades que lo cumplan, amplío un poco la búsqueda y te aviso.",
  proximity: "Marcá qué tan importante es cada cosa. Todas arrancan en “Me importa”.",
  details: "Opcional. Si los marcás, suman puntos a las propiedades que los tienen.",
  work: "Opcional. Con la dirección te muestro más arriba lo que te queda más cerca (en línea recta, no en tiempo de viaje) y en cada resultado te digo a cuánta distancia queda."
};

/** Opción de respuesta única (radio con forma de tarjeta). */
function OptionCard({ selected, onClick, label, hint, note }) {
  return <button type="button" role="radio" aria-checked={selected} onClick={onClick} className={cn("w-full text-left rounded-lg border p-4 transition-colors flex items-start gap-3", selected ? "border-primary bg-primary/10" : "border-outline-variant bg-surface-container-lowest hover:border-outline")}>
      <span className={cn("mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0", selected ? "border-primary bg-primary text-on-primary" : "border-outline")}>
        {selected && <Check className="w-3 h-3" />}
      </span>
      <span className="flex-1">
        <span className={cn("block text-sm", selected ? "font-bold text-primary" : "font-semibold text-on-surface")}>{label}</span>
        {hint && <span className="block text-xs text-on-surface-variant mt-0.5">{hint}</span>}
        {selected && note && <span className="block text-xs text-on-surface-variant mt-1">{note}</span>}
      </span>
    </button>;
}

/** Buscador de dirección con autocompletado real (mismo servicio que Life Score y Publicar). */
function AddressPicker({ value, onChange }) {
  const [text, setText] = useState(value?.address ?? "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  useEffect(() => () => clearTimeout(debounceRef.current), []);

  function handleInput(next) {
    setText(next);
    onChange(null); // hasta elegir una sugerencia no hay coordenadas
    setOpen(true);
    clearTimeout(debounceRef.current);
    if (next.trim().length < 5) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/addresses/search", { params: { q: next.trim() } });
        setSuggestions(res.data);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }
  function choose(s) {
    setText(s.label);
    setSuggestions([]);
    setOpen(false);
    onChange({ address: s.label, lat: s.lat, lon: s.lon });
  }
  function clear() {
    setText("");
    setSuggestions([]);
    onChange(null);
  }
  return <div className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-4 w-4 text-outline" />
        <Input className="pl-9 pr-9" value={text} onChange={e => handleInput(e.target.value)} onFocus={() => setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 150)} placeholder="Dirección en CABA (ej: Av. Cabildo 2100)" aria-label="Dirección de trabajo o estudio" />
        {text && <button type="button" onClick={clear} aria-label="Borrar dirección" className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface"><X className="w-5 h-5" /></button>}
        {open && (loading || suggestions.length > 0) && <div className="absolute z-20 top-full mt-1 w-full rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg max-h-56 overflow-y-auto">
            {loading ? <p className="px-3 py-2 text-xs text-on-surface-variant">Buscando…</p> : suggestions.map(s => <button key={s.label} type="button" onMouseDown={() => choose(s)} className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors border-b border-outline-variant last:border-0">{s.label}</button>)}
          </div>}
      </div>
      {value?.lat != null
        ? <p className="text-xs text-on-surface-variant flex items-center gap-1"><Check className="w-3 h-3 text-primary" /> Dirección elegida.</p>
        : text.trim() && !loading && <p className="text-xs text-on-surface-variant">Elegí una de las sugerencias para usarla.</p>}
    </div>;
}

export default function Recomendador() {
  const { status: usage, blocked: quotaBlocked, refresh: refreshUsage } = useUsage("recommendation");
  const { blueRate } = useBlueRate();
  const [phase, setPhase] = useState("intro"); // intro | questions | searching | results
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState(initialAnswers);
  const [prices, setPrices] = useState(null); // precios reales de la operación elegida, ordenados (null = cargando)
  const [pricesError, setPricesError] = useState(false);
  const [expenseValues, setExpenseValues] = useState([]); // expensas reales de los departamentos, en pesos por mes y ordenadas
  const [result, setResult] = useState(null);
  const [searchSteps, setSearchSteps] = useState([]);
  const runRef = useRef(0);

  // Orden aleatorio de las categorías (una vez por visita) para que la posición no sesgue las respuestas.
  const proximityOrder = useMemo(() => shuffle(PROXIMITY_CATEGORIES), []);

  const stepId = STEP_IDS[stepIndex];
  const isOptional = OPTIONAL_STEP_IDS.includes(stepId);
  const op = answers.operationType;

  // La barra de presupuesto se arma con los precios reales de la operación (alquiler en ARS, venta en USD).
  // Arranca en "sin tope" (extremo derecho) y la persona lo baja hasta lo máximo que pagaría.
  useEffect(() => {
    if (!op) return;
    let cancelled = false;
    setPrices(null);
    setPricesError(false);
    api.get("/api/recommendations/budget-prices", { params: { operationType: op } })
      .then(res => {
        if (cancelled) return;
        setPrices(res.data);
        if (res.data.length > 0) {
          setAnswers(prev => prev.budget == null ? { ...prev, budget: { min: null, max: null, position: 100 } } : prev);
        }
      })
      .catch(() => { if (!cancelled) { setPrices([]); setPricesError(true); } });
    return () => { cancelled = true; };
  }, [op]);

  // Expensas: solo si busca departamento. Se guardan en USD y se muestran en pesos con el dólar blue (como la ficha).
  const wantsExpenses = op != null && answers.typeChoice === "APARTMENT" && blueRate > 0;
  useEffect(() => {
    if (!wantsExpenses) { setExpenseValues([]); return; }
    let cancelled = false;
    api.get("/api/recommendations/budget-expenses", { params: { operationType: op } })
      .then(res => {
        if (cancelled || !Array.isArray(res.data)) return;
        setExpenseValues(res.data.map(usd => Number(usd) * blueRate).sort((a, b) => a - b));
      })
      .catch(() => { if (!cancelled) setExpenseValues([]); });
    return () => { cancelled = true; };
  }, [wantsExpenses, op, blueRate]);

  function update(patch) {
    setAnswers(prev => ({ ...prev, ...patch }));
  }
  function chooseOperation(value) {
    // Cambiar de operación invalida el presupuesto elegido (los tramos son otros) y los detalles propios de cada una.
    if (value === op) return;
    setAnswers(prev => ({ ...prev, operationType: value, budget: null, expenses: null, details: {} }));
  }

  // `finalAnswers` permite buscar con respuestas ajustadas en el mismo clic (por ejemplo, al saltear un paso opcional),
  // sin esperar a que React aplique el cambio de estado.
  async function search(finalAnswers = answers) {
    const runId = ++runRef.current;
    const steps = searchingSteps(finalAnswers);
    setSearchSteps(steps);
    setPhase("searching");
    // Mínimo de pantalla de búsqueda solo para que no parpadee si el servidor responde al instante.
    // No simula avance: apenas llega la respuesta (y pasó ese mínimo) se muestran los resultados.
    const minimum = new Promise(resolve => setTimeout(resolve, MIN_SEARCH_MS));
    try {
      const [res] = await Promise.all([api.post("/api/recommendations", buildRequest(finalAnswers, blueRate)), minimum]);
      if (runRef.current !== runId) return;
      setResult(res.data);
      setPhase("results");
      refreshUsage();
    } catch (error) {
      if (runRef.current !== runId) return;
      // Sin recomendaciones gratis este mes (429): se vuelve a la pantalla de
      // inicio, donde QuotaNotice muestra el bloqueo y la invitación al plan pago.
      if (isQuotaExceeded(error)) {
        refreshUsage();
        setPhase("intro");
        return;
      }
      toast.error(apiErrorMessage(error, "No pudimos armar tus recomendaciones. Probá de nuevo en un momento."));
      setPhase("questions");
    }
  }

  function next() {
    if (stepIndex < STEP_IDS.length - 1) {
      setStepIndex(i => i + 1);
    } else {
      search(answers);
    }
  }
  function back() {
    if (stepIndex > 0) setStepIndex(i => i - 1);
    else setPhase("intro");
  }
  function restart() {
    runRef.current++;
    setAnswers(initialAnswers());
    setResult(null);
    setStepIndex(0);
    setPhase("intro");
  }
  function edit() {
    setStepIndex(0);
    setPhase("questions");
  }

  const shell = children => <div className="p-4 sm:p-6 md:p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="space-y-1 lg:mt-8">
        <h1 className="text-2xl font-bold text-on-surface">Recomendación con Nidi</h1>
        <p className="text-sm text-on-surface-variant font-mono">Respondé unas preguntas y te muestro las propiedades que mejor encajan con vos, explicándote por qué encaja cada una.</p>
      </div>
      {/* Cuota mensual, arriba de todo: si ya no quedan, se bloquea antes de empezar para no
          hacer responder las 8 preguntas en vano. */}
      {phase === "intro" && <QuotaNotice feature="recommendation" status={usage} />}
      {children}
    </div>;

  if (phase === "intro") {
    return shell(<Card><CardContent className="p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <Nidi mode="idle" width={190} />
        <div className="space-y-4 flex-1">
          <h2 className="text-xl font-bold text-on-surface">¡Hola! Soy Nidi</h2>
          <p className="text-sm text-on-surface leading-relaxed">
            Te hago 8 preguntas rápidas (y 2 opcionales) y, con los precios, la seguridad, el ruido y lo que hay cerca de cada propiedad, te muestro las que mejor encajan con vos y por qué.
          </p>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            No guardamos tus respuestas: se usan para armar esta recomendación y se descartan. Es una guía orientativa basada en datos públicos; no reemplaza visitar la propiedad.
          </p>
          <Button type="button" size="lg" className="gap-2" disabled={quotaBlocked} onClick={() => { setStepIndex(0); setPhase("questions"); }}>
            Empezar <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent></Card>);
  }

  if (phase === "searching") {
    return shell(<Card><CardContent className="p-4 sm:p-6 md:p-8"><SearchingScreen steps={searchSteps} /></CardContent></Card>);
  }

  if (phase === "results" && result) {
    return shell(<RecommendationResults result={result} onEdit={edit} onRestart={restart} />);
  }

  // ---- Preguntas ----
  const answered = isStepAnswered(stepId, answers);
  const isLast = stepIndex === STEP_IDS.length - 1;
  const progressLabel = isOptional ? `Paso opcional ${stepIndex - REQUIRED_STEPS + 1} de ${STEP_IDS.length - REQUIRED_STEPS}` : `Pregunta ${stepIndex + 1} de ${REQUIRED_STEPS}`;
  const progress = Math.round((stepIndex + 1) / STEP_IDS.length * 100);

  let body = null;
  if (stepId === "operation") {
    body = <div role="radiogroup" aria-label={QUESTIONS.operation} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {OPERATION_OPTIONS.map(o => <OptionCard key={o.value} selected={op === o.value} onClick={() => chooseOperation(o.value)} label={o.label} />)}
      </div>;
  } else if (stepId === "type") {
    body = <div role="radiogroup" aria-label={QUESTIONS.type} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {TYPE_OPTIONS.map(o => <OptionCard key={o.value} selected={answers.typeChoice === o.value} onClick={() => update({ typeChoice: o.value })} label={o.label} note={o.note} />)}
      </div>;
  } else if (stepId === "budget") {
    body = prices == null
      ? <p className="text-sm text-on-surface-variant font-mono">Calculando la barra de precios…</p>
      : prices.length === 0
        ? <p className="text-sm text-alert-price">{pricesError ? "No pudimos cargar los precios. Probá de nuevo en un momento." : "Todavía no hay propiedades publicadas en esta operación."}</p>
        : <div className="space-y-6">
            <BudgetSlider prices={prices} operationType={op} value={answers.budget} onChange={budget => update({ budget })} />
            {wantsExpenses && expenseValues.length > 0
              && <ExpensesSlider valuesArs={expenseValues} operationType={op} value={answers.expenses} onChange={expenses => update({ expenses })} />}
          </div>;
  } else if (stepId === "household") {
    const minRooms = effectiveMinRooms(answers);
    body = <div className="space-y-6">
        <div role="radiogroup" aria-label={QUESTIONS.household} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {HOUSEHOLD_OPTIONS.map(o => <OptionCard key={o.value} selected={answers.household === o.value} onClick={() => update({ household: o.value })} label={o.label} hint={o.hint} />)}
        </div>
        {answers.household && <div className="space-y-2">
            <p className="text-sm font-semibold text-on-surface">¿Cuántos ambientes necesitás como mínimo?</p>
            <p className="text-xs text-on-surface-variant">Te sugerimos {SUGGESTED_FOR_TEXT[answers.household]}, pero lo podés cambiar. Solo te muestro propiedades con esa cantidad de ambientes o más.</p>
            <div role="radiogroup" aria-label="Ambientes mínimos" className="flex flex-wrap gap-2">
              {ROOMS_CHOICES.map(n => <button key={n} type="button" role="radio" aria-checked={minRooms === n} onClick={() => update({ minRooms: n })} className={cn("min-w-14 text-sm py-2 px-4 rounded-md border transition-colors", minRooms === n ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                  {n}+
                </button>)}
            </div>
          </div>}
      </div>;
  } else if (stepId === "dealbreaker") {
    body = <div role="radiogroup" aria-label={QUESTIONS.dealbreaker} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DEALBREAKER_OPTIONS.map(o => <OptionCard key={o.value} selected={answers.dealbreaker === o.value} onClick={() => update({ dealbreaker: o.value })} label={o.label} />)}
      </div>;
  } else if (stepId === "noise") {
    body = <div role="radiogroup" aria-label={QUESTIONS.noise} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {NOISE_OPTIONS.map(o => <OptionCard key={o.value} selected={answers.noisePreference === o.value} onClick={() => update({ noisePreference: o.value })} label={o.label} />)}
      </div>;
  } else if (stepId === "proximity") {
    body = <div className="space-y-2">
        {proximityOrder.map(c => <div key={c.key} role="radiogroup" aria-label={c.label} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 rounded-lg border border-outline-variant bg-surface-container-lowest p-3">
            <span className="text-sm font-semibold text-on-surface sm:w-56">{c.label}</span>
            <div className="flex flex-1 rounded-md border border-outline-variant p-0.5 bg-surface-container-low">
              {IMPORTANCE_LEVELS.map(level => {
                const selected = answers.proximity[c.key] === level.value;
                return <button key={level.value} type="button" role="radio" aria-checked={selected} onClick={() => update({ proximity: { ...answers.proximity, [c.key]: level.value } })} className={cn("flex-1 px-2 py-1.5 rounded text-xs sm:text-sm transition-all", selected ? "font-bold bg-primary text-on-primary shadow-sm" : "font-medium text-on-surface-variant hover:text-on-surface")}>
                    {level.label}
                  </button>;
              })}
            </div>
          </div>)}
      </div>;
  } else if (stepId === "overpriced") {
    body = <div role="radiogroup" aria-label={QUESTIONS.overpriced} className="grid grid-cols-1 gap-3">
        {OVERPRICED_OPTIONS.map(o => <OptionCard key={o.value} selected={answers.overpricedPolicy === o.value} onClick={() => update({ overpricedPolicy: o.value })} label={o.label} />)}
      </div>;
  } else if (stepId === "details") {
    body = <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {DETAIL_OPTIONS.filter(o => !o.only || o.only === op).map(o => {
          const checked = !!answers.details[o.key];
          return <button key={o.key} type="button" role="checkbox" aria-checked={checked} onClick={() => update({ details: { ...answers.details, [o.key]: !checked } })} className={cn("w-full text-left rounded-lg border p-4 flex items-center gap-3 transition-colors", checked ? "border-primary bg-primary/10" : "border-outline-variant bg-surface-container-lowest hover:border-outline")}>
              <span className={cn("w-5 h-5 rounded border flex items-center justify-center flex-shrink-0", checked ? "border-primary bg-primary text-on-primary" : "border-outline")}>{checked && <Check className="w-3 h-3" />}</span>
              <span className={cn("text-sm", checked ? "font-bold text-primary" : "font-semibold text-on-surface")}>{o.label}</span>
            </button>;
        })}
      </div>;
  } else if (stepId === "work") {
    body = <div className="space-y-5">
        <AddressPicker value={answers.work} onChange={work => update({ work })} />
        {answers.work?.lat != null && <div className="space-y-2">
            <p className="text-sm font-semibold text-on-surface">¿Qué tanto te importa que quede cerca?</p>
            <div role="radiogroup" aria-label="Importancia de la cercanía al trabajo o estudio" className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {WORK_IMPORTANCE_OPTIONS.map(o => <OptionCard key={o.value} selected={answers.workImportance === o.value} onClick={() => update({ workImportance: o.value })} label={o.label} hint={o.hint} />)}
            </div>
          </div>}
      </div>;
  }

  return shell(<Card><CardContent className="p-4 sm:p-6 md:p-8 space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-on-surface-variant">
          <span>{progressLabel}</span>
          <span>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full bg-surface-container overflow-hidden" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Avance del test">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="flex items-start gap-4">
        <Nidi mode="idle" width={72} className="hidden sm:block" />
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-on-surface">{QUESTIONS[stepId]}</h2>
          {SUBTITLES[stepId] && <p className="text-sm text-on-surface-variant">{SUBTITLES[stepId]}</p>}
        </div>
      </div>

      {body}

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-outline-variant">
        <Button type="button" variant="ghost" className="gap-2" onClick={back}><ArrowLeft className="w-4 h-4" /> Atrás</Button>
        <div className="flex flex-wrap items-center gap-3">
          {stepId === "overpriced" && <button type="button" disabled={!answered || !allRequiredAnswered(answers)} onClick={() => search({ ...answers, details: {}, work: null })} className="text-sm font-semibold text-primary underline underline-offset-2 disabled:opacity-40 disabled:no-underline">
              Buscar sin los pasos opcionales
            </button>}
          {isOptional && <Button type="button" variant="outline" onClick={() => {
              if (stepId === "work") {
                search({ ...answers, work: null });
              } else {
                update({ details: {} });
                next();
              }
            }}>
              Saltar
            </Button>}
          <Button type="button" className="gap-2" disabled={!answered || (isLast && !allRequiredAnswered(answers))} onClick={() => next()}>
            {isLast ? <><Search className="w-4 h-4" /> Buscar con Nidi</> : <>Siguiente <ArrowRight className="w-4 h-4" /></>}
          </Button>
        </div>
      </div>
    </CardContent></Card>);
}
