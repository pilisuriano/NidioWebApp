import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Check, AlertCircle, CheckCircle2, MapPin, Building2, Calculator, Loader2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { formatPrice, formatNumber } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

const STEPS = ["Principales", "Multimedia", "Extras", "Publicar"];

const PROPERTY_TYPES = [{ value: "APARTMENT", label: "Departamento" }, { value: "HOUSE", label: "Casa" }, { value: "PH", label: "PH" }];

const PUBLISHER_TYPES = [{ value: "OWNER", label: "Dueño directo" }, { value: "AGENCY", label: "Inmobiliaria" }];

const ORIENTATIONS = [{ value: "", label: "Sin especificar" }, { value: "Frente", label: "Frente" }, { value: "Contrafrente", label: "Contrafrente" }, { value: "Interno", label: "Interno" }, { value: "Lateral", label: "Lateral" }];

// El borrador se guarda para poder ir a "Tasación" a mitad de carga (a
// consultar un precio de referencia) y volver acá sin perder lo cargado.
const DRAFT_KEY = "nidio_publicar_draft";

function loadDraft() {
  try {
    return JSON.parse(sessionStorage.getItem(DRAFT_KEY));
  } catch {
    return null;
  }
}

function Stepper({ step }) {
  return <div className="flex items-center max-w-2xl mx-auto mb-10">
      {STEPS.map((label, i) => <div key={label} className="flex items-center flex-1 last:flex-none">
          <div className="flex flex-col items-center gap-2">
            <div className={cn("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors", i < step ? "bg-primary border-primary text-on-primary" : i === step ? "border-primary text-primary" : "border-outline-variant text-outline")}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-xs font-semibold whitespace-nowrap", i <= step ? "text-primary" : "text-outline")}>{label}</span>
          </div>
          {i < STEPS.length - 1 && <div className={cn("h-0.5 flex-1 mx-2 mb-5", i < step ? "bg-primary" : "bg-outline-variant")} />}
        </div>)}
    </div>;
}

export default function Publicar() {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Quién publica no es una elección manual: lo determina el tipo de
  // cuenta. Una cuenta profesional siempre publica como Inmobiliaria (así
  // se le muestra el check de verificada y su logo en el aviso); una cuenta
  // común siempre publica como Dueño directo.
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const draft = loadDraft();
  const [step, setStep] = useState(draft?.step ?? 0);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(null);
  // Foto que se muestra grande en el paso "Revisá antes de publicar" — se
  // elige haciendo click en alguna de las miniaturas de abajo, para poder
  // ver todas las fotos cargadas y no solo la primera con un "+N foto".
  const [previewIndex, setPreviewIndex] = useState(0);

  // Si había un borrador guardado de antes de que "Foto" pasara a ser una
  // lista (imageUrls), imageUrls puede venir undefined o con la forma vieja
  // (imageUrl string) — se sanea acá para no romper el resto del componente.
  const [form, setForm] = useState(() => {
    const base = {
      operationType: "SALE",
      propertyType: "APARTMENT",
      publisherType: "OWNER",
      neighborhoodId: "",
      address: "",
      // Coordenadas de la dirección elegida en el listado de sugerencias de
      // georef.ar (ver handleAddressInput/selectAddressSuggestion abajo).
      // Se exigen para poder publicar: es lo que el backend usa para
      // verificar que la dirección esté realmente dentro del barrio elegido.
      lat: null,
      lon: null,
      surfaceM2: "",
      totalSurfaceM2: "",
      rooms: 2,
      bathrooms: "",
      ageYears: "",
      orientation: "",
      price: "",
      imageUrls: [],
      description: ""
    };
    if (!draft?.form) return base;
    return { ...base, ...draft.form, imageUrls: Array.isArray(draft.form.imageUrls) ? draft.form.imageUrls : [] };
  });

  useEffect(() => {
    api.get("/api/neighborhoods").then(res => {
      setNeighborhoods(res.data);
      setForm(f => f.neighborhoodId ? f : { ...f, neighborhoodId: String(res.data[0]?.id ?? "") });
    }).catch(() => setError("No se pudieron cargar los barrios"));
  }, []);

  // Fuerza publisherType según la cuenta (ver comentario de isProfessional
  // arriba) — también pisa un borrador viejo guardado antes de este cambio.
  useEffect(() => {
    setForm(f => ({ ...f, publisherType: isProfessional ? "AGENCY" : "OWNER" }));
  }, [isProfessional]);

  // Se guarda en cada cambio para poder ir a "Tasación" y volver sin perder
  // lo cargado (ver DRAFT_KEY).
  useEffect(() => {
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ form, step }));
  }, [form, step]);

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  // Autocomplete de dirección (georef.ar, vía backend en /api/addresses/search):
  // mientras se tipea, se buscan direcciones reales de CABA con debounce; al
  // elegir una, se guardan sus lat/lon en el form (el backend los exige para
  // publicar y valida que caigan dentro del barrio elegido). Editar el texto
  // a mano invalida la selección anterior (lat/lon vuelven a null).
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressDebounceRef = useRef(null);

  function handleAddressInput(value) {
    setForm(f => ({ ...f, address: value, lat: null, lon: null }));
    setShowAddressSuggestions(true);
    if (addressDebounceRef.current) clearTimeout(addressDebounceRef.current);
    if (value.trim().length < 5) {
      setAddressSuggestions([]);
      return;
    }
    addressDebounceRef.current = setTimeout(async () => {
      setAddressLoading(true);
      try {
        const res = await api.get("/api/addresses/search", { params: { q: value.trim() } });
        setAddressSuggestions(res.data);
      } catch {
        setAddressSuggestions([]);
      } finally {
        setAddressLoading(false);
      }
    }, 400);
  }

  function selectAddressSuggestion(suggestion) {
    setForm(f => ({ ...f, address: suggestion.label, lat: suggestion.lat, lon: suggestion.lon }));
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
  }

  // Chequeo "en vivo" de que la dirección elegida esté realmente dentro del
  // barrio seleccionado: apenas hay lat/lon (de una sugerencia elegida) y un
  // barrio, se consulta al backend (misma validación que usa
  // PropertyService.createProperty al publicar) para avisar acá mismo, en
  // vez de que el usuario se entere recién al final del wizard.
  const [addressMismatch, setAddressMismatch] = useState(null);
  const [addressChecking, setAddressChecking] = useState(false);

  useEffect(() => {
    if (form.lat == null || form.lon == null || !form.neighborhoodId) {
      setAddressMismatch(null);
      return;
    }
    let cancelled = false;
    setAddressChecking(true);
    api.get("/api/addresses/validate", { params: { lat: form.lat, lon: form.lon, neighborhoodId: form.neighborhoodId } })
      .then(res => {
        if (cancelled) return;
        setAddressMismatch(res.data.valid ? null : res.data);
      })
      .catch(() => { if (!cancelled) setAddressMismatch(null); })
      .finally(() => { if (!cancelled) setAddressChecking(false); });
    return () => { cancelled = true; };
  }, [form.lat, form.lon, form.neighborhoodId]);

  function clearDraft() {
    sessionStorage.removeItem(DRAFT_KEY);
  }

  function stepIsValid(i) {
    if (i === 0) {
      return form.neighborhoodId && form.address.trim() && form.lat != null && form.lon != null && !addressMismatch && Number(form.surfaceM2) > 0 && form.rooms > 0 && Number(form.price) > 0;
    }
    return true;
  }

  function handleNext() {
    setError(null);
    if (!stepIsValid(step)) {
      if (step === 0 && addressMismatch) {
        setError("Corregí el barrio o la dirección: no coinciden (ver el aviso arriba de Dirección).");
      } else if (step === 0 && form.neighborhoodId && form.address.trim() && (form.lat == null || form.lon == null)) {
        setError("Elegí una dirección de la lista de sugerencias para poder continuar: así verificamos que exista y que esté en el barrio elegido.");
      } else {
        setError("Completá los campos obligatorios antes de continuar");
      }
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }

  function handleBack() {
    setError(null);
    setStep(s => Math.max(s - 1, 0));
  }

  async function handlePublish() {
    setError(null);
    setSubmitting(true);
    try {
      const res = await api.post("/api/properties", {
        propertyType: form.propertyType,
        operationType: form.operationType,
        neighborhoodId: Number(form.neighborhoodId),
        address: form.address.trim(),
        lat: form.lat,
        lon: form.lon,
        surfaceM2: Number(form.surfaceM2),
        totalSurfaceM2: form.totalSurfaceM2 ? Number(form.totalSurfaceM2) : null,
        rooms: Number(form.rooms),
        bathrooms: form.bathrooms ? Number(form.bathrooms) : null,
        ageYears: form.ageYears !== "" ? Number(form.ageYears) : null,
        orientation: form.orientation || null,
        price: Number(form.price),
        imageUrls: form.imageUrls,
        description: form.description.trim() || null,
        publisherType: form.publisherType
      });
      setCreated(res.data);
      clearDraft();
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo publicar el aviso"));
    } finally {
      setSubmitting(false);
    }
  }

  const selectedNeighborhood = neighborhoods.find(n => String(n.id) === form.neighborhoodId);

  if (created) {
    return <div className="p-8 max-w-2xl mx-auto animate-in fade-in duration-500">
        <Card>
          <CardContent className="p-10 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-good-value/10 text-good-value flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-on-surface">¡Tu aviso ya está publicado!</h1>
              <p className="text-on-surface-variant">{created.title} · {created.address}</p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" onClick={() => {
                setCreated(null);
                setStep(0);
                setForm(f => ({ ...f, address: "", lat: null, lon: null, surfaceM2: "", totalSurfaceM2: "", bathrooms: "", ageYears: "", orientation: "", price: "", imageUrls: [], description: "" }));
              }}>
                Publicar otro
              </Button>
              <Button onClick={() => navigate(`/mapa?search=${encodeURIComponent(selectedNeighborhood?.name ?? "")}`)}>
                Ver en el mapa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>;
  }

  return <div className="p-8 max-w-4xl mx-auto space-y-2 animate-in fade-in duration-500">
      <div className="text-center space-y-1 mb-6">
        <h1 className="text-2xl font-bold text-on-surface">Publicá tu propiedad</h1>
        <p className="text-sm text-on-surface-variant">Cargala en pocos pasos y sumala al catálogo de Nidio.</p>
      </div>

      <Stepper step={step} />

      <Card>
        <CardContent className="p-8 space-y-6">
          {error && <div className="bg-error-container text-on-error-container text-sm rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>}

          {step === 0 && <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Tipo de operación</label>
                <div className="flex rounded-md border border-outline-variant p-1 bg-surface-container-low max-w-xs">
                  {[{ value: "SALE", label: "Venta" }, { value: "RENT", label: "Alquiler" }].map(op => <button key={op.value} type="button" onClick={() => update("operationType", op.value)} className={cn("flex-1 rounded text-sm py-2 transition-all", form.operationType === op.value ? "font-bold bg-primary text-on-primary shadow-sm" : "font-medium text-on-surface-variant hover:text-on-surface")}>
                      {op.label}
                    </button>)}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">¿Quién publica?</label>
                <p className="text-sm text-on-surface-variant">
                  Publicás como <span className="font-semibold text-on-surface">{PUBLISHER_TYPES.find(t => t.value === form.publisherType)?.label}</span>, según tu tipo de cuenta.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Tipo de propiedad</label>
                <div className="flex gap-2 max-w-md">
                  {PROPERTY_TYPES.map(t => <button key={t.value} type="button" onClick={() => update("propertyType", t.value)} className={cn("flex-1 text-sm py-2 rounded-md transition-all", form.propertyType === t.value ? "border-2 border-primary bg-primary/5 text-primary font-bold" : "border border-outline-variant hover:border-outline text-on-surface-variant font-medium")}>
                      {t.label}
                    </button>)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="barrio">Barrio (CABA)</label>
                  <select id="barrio" value={form.neighborhoodId} onChange={e => update("neighborhoodId", e.target.value)} required className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary">
                    {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3 relative">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="address">Dirección</label>
                  <Input
                    id="address"
                    placeholder="Ej: Av. Santa Fe 3253"
                    value={form.address}
                    onChange={e => handleAddressInput(e.target.value)}
                    onFocus={() => setShowAddressSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowAddressSuggestions(false), 150)}
                    autoComplete="off"
                  />
                  {showAddressSuggestions && (addressLoading || addressSuggestions.length > 0) && <div className="absolute z-20 top-full mt-1 w-full rounded-md border border-outline-variant bg-surface-container-lowest shadow-lg max-h-56 overflow-y-auto">
                      {addressLoading
                        ? <p className="px-3 py-2 text-xs text-on-surface-variant font-mono flex items-center gap-2"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Buscando direcciones…</p>
                        : addressSuggestions.map(s => <button key={s.label} type="button" onMouseDown={() => selectAddressSuggestion(s)} className="w-full text-left px-3 py-2 text-sm text-on-surface hover:bg-surface-container transition-colors border-b border-outline-variant last:border-0">
                            {s.label}
                          </button>)}
                    </div>}
                  {form.address.trim() && form.lat == null && !addressLoading && !showAddressSuggestions && <p className="text-xs font-semibold text-error">Elegí una dirección de la lista para poder publicar</p>}
                  {form.lat != null && addressChecking && <p className="text-xs text-on-surface-variant flex items-center gap-1"><Loader2 className="w-3.5 h-3.5 animate-spin" /> Verificando que esté en el barrio elegido…</p>}
                  {form.lat != null && !addressChecking && addressMismatch && <p className="text-xs font-semibold text-error">
                      La dirección ingresada no está dentro de {selectedNeighborhood?.name ?? "el barrio elegido"}.
                      {addressMismatch.actualNeighborhoodName && ` Según la dirección ingresada, parecería estar en ${addressMismatch.actualNeighborhoodName}.`}
                    </p>}
                  {form.lat != null && !addressChecking && !addressMismatch && <p className="text-xs font-semibold text-good-value flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Dirección verificada</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="surface">Superficie total (m²)</label>
                  <Input id="surface" type="number" min={1} placeholder="Ej: 45" value={form.surfaceM2} onChange={e => update("surfaceM2", e.target.value)} />
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest">Ambientes</label>
                  <div className="flex border border-outline-variant rounded-md overflow-hidden bg-surface-container-lowest h-10">
                    <button type="button" onClick={() => update("rooms", Math.max(1, form.rooms - 1))} className="px-3 hover:bg-surface-container transition-colors border-r border-outline-variant">-</button>
                    <input type="text" value={form.rooms} readOnly className="w-full text-center font-bold text-sm bg-transparent outline-none" />
                    <button type="button" onClick={() => update("rooms", Math.min(8, form.rooms + 1))} className="px-3 hover:bg-surface-container transition-colors border-l border-outline-variant">+</button>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="price">Precio</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm font-bold text-on-surface-variant">{form.operationType === "SALE" ? "USD" : "ARS"}</span>
                    <Input id="price" type="number" min={0} className="pl-12" placeholder="0" value={form.price} onChange={e => update("price", e.target.value)} />
                  </div>
                  {form.neighborhoodId && <Link
                    to={`/tasacion?from=publicar&operationType=${form.operationType}&propertyType=${form.propertyType}&neighborhoodId=${form.neighborhoodId}&surfaceM2=${form.surfaceM2}&rooms=${form.rooms}`}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    <Calculator className="w-3.5 h-3.5" /> ¿No sabés qué precio poner? Consultá una tasación
                  </Link>}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Características adicionales (opcional)</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant" htmlFor="totalSurface">Superficie cubierta (m²)</label>
                    <Input id="totalSurface" type="number" min={0} placeholder="Ej: 50" value={form.totalSurfaceM2} onChange={e => update("totalSurfaceM2", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant" htmlFor="bathrooms">Baños</label>
                    <Input id="bathrooms" type="number" min={0} placeholder="Ej: 1" value={form.bathrooms} onChange={e => update("bathrooms", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant" htmlFor="ageYears">Antigüedad (años)</label>
                    <Input id="ageYears" type="number" min={0} placeholder="Ej: 10" value={form.ageYears} onChange={e => update("ageYears", e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs text-on-surface-variant" htmlFor="orientation">Orientación</label>
                    <select id="orientation" value={form.orientation} onChange={e => update("orientation", e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary">
                      {ORIENTATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>}

          {step === 1 && <div className="space-y-4">
              <label className="text-xs font-bold text-outline uppercase tracking-widest">Fotos de la propiedad</label>
              <ImageUploader images={form.imageUrls} onChange={urls => update("imageUrls", urls)} />
            </div>}

          {step === 2 && <div className="space-y-3">
              <label className="text-xs font-bold text-outline uppercase tracking-widest" htmlFor="description">Descripción (opcional)</label>
              <textarea id="description" rows={6} placeholder="Contá más sobre la propiedad: amenities, estado, orientación..." value={form.description} onChange={e => update("description", e.target.value)} className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none focus:border-primary resize-none" />
            </div>}

          {step === 3 && <div className="space-y-4">
              <p className="text-xs font-bold text-outline uppercase tracking-widest">Revisá antes de publicar</p>
              <div className="rounded-lg border border-outline-variant overflow-hidden">
                <div className="h-44 bg-surface-dim relative">
                  {form.imageUrls[Math.min(previewIndex, Math.max(0, form.imageUrls.length - 1))] && <img src={form.imageUrls[Math.min(previewIndex, Math.max(0, form.imageUrls.length - 1))]} alt="" className="w-full h-full object-cover" />}
                  <Badge className="absolute top-3 right-3" variant="good">{form.operationType === "SALE" ? "VENTA" : "ALQUILER"}</Badge>
                </div>
                {form.imageUrls.length > 1 && <div className="flex gap-2 overflow-x-auto px-3 py-2 bg-surface-container-low border-t border-outline-variant">
                    {form.imageUrls.map((url, i) => <button key={url + i} type="button" onClick={() => setPreviewIndex(i)} className={cn("w-14 h-14 rounded-md overflow-hidden shrink-0 border-2 transition-colors", i === previewIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}>
                        <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      </button>)}
                  </div>}
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-on-surface">{PROPERTY_TYPES.find(t => t.value === form.propertyType)?.label} en {selectedNeighborhood?.name ?? "—"}</h3>
                      <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {form.address || "—"}</p>
                    </div>
                    <span className="font-bold text-primary text-sm">{form.price ? formatPrice(Number(form.price), form.operationType) : "—"}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs font-mono border-t border-outline-variant pt-3">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {form.rooms} amb.</span>
                    <span>{form.surfaceM2 ? `${formatNumber(Number(form.surfaceM2))} m² tot.` : "—"}</span>
                    {form.totalSurfaceM2 && <span>{formatNumber(Number(form.totalSurfaceM2))} m² cub.</span>}
                    {form.bathrooms && <span>{form.bathrooms} baño{Number(form.bathrooms) > 1 ? "s" : ""}</span>}
                    {form.ageYears !== "" && <span>{Number(form.ageYears) === 0 ? "A estrenar" : `${form.ageYears} años`}</span>}
                    {form.orientation && <span>{form.orientation}</span>}
                  </div>
                  <div className="text-xs text-on-surface-variant border-t border-outline-variant pt-3">
                    Publica: <span className="font-semibold text-on-surface">{PUBLISHER_TYPES.find(t => t.value === form.publisherType)?.label}</span>
                  </div>
                  {form.description && <p className="text-xs text-on-surface-variant border-t border-outline-variant pt-3">{form.description}</p>}
                </div>
              </div>
            </div>}
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={step === 0 || submitting}>
          Atrás
        </Button>
        {step < STEPS.length - 1
          ? <Button onClick={handleNext}>Continuar</Button>
          : <Button onClick={handlePublish} disabled={submitting}>{submitting ? "Publicando…" : "Publicar aviso"}</Button>}
      </div>

      <p className="text-center text-xs text-on-surface-variant pt-2">
        ¿Cambiaste de idea? <Link to="/" className="text-primary font-semibold hover:underline">Volver a Inicio</Link>
      </p>
    </div>;
}
