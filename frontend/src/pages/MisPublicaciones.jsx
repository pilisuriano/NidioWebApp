import { useEffect, useState } from "react";
import { optimizedImage, IMG_CARD } from "@/lib/images";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { FeaturedBadge } from "@/components/property/PropertyBadges";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ClipboardList, Search, MapPin, Building2, Ruler, Heart, Eye, EyeOff, Trash2, ExternalLink, AlertTriangle, Pencil, Star, CalendarClock, CheckCircle2, Tag, KeyRound } from "lucide-react";
import { toast } from "react-toastify";
import { api, apiErrorMessage } from "@/lib/api";
import { formatPrice, formatNumber, formatDate, PROPERTY_TYPE_LABEL, OPERATION_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";
import { activateFeatured, getFeaturedAvailability, invalidateFeaturedIds, useBillingSummary, useCatalog, useFeaturedIds } from "@/lib/billing";

const SORT_OPTIONS = [
  { value: "createdAt-desc", label: "Más recientes", sortBy: "createdAt", sortDir: "desc" },
  { value: "createdAt-asc", label: "Más antiguas", sortBy: "createdAt", sortDir: "asc" },
  { value: "price-desc", label: "Precio: mayor a menor", sortBy: "price", sortDir: "desc" },
  { value: "price-asc", label: "Precio: menor a mayor", sortBy: "price", sortDir: "asc" },
  { value: "surfaceM2-desc", label: "Superficie: mayor a menor", sortBy: "surfaceM2", sortDir: "desc" },
  { value: "surfaceM2-asc", label: "Superficie: menor a mayor", sortBy: "surfaceM2", sortDir: "asc" },
  { value: "title-asc", label: "Título A-Z", sortBy: "title", sortDir: "asc" }
];

const ACTIVE_FILTERS = [
  { value: "", label: "Todas" },
  { value: "true", label: "Activas" },
  { value: "false", label: "Inactivas" },
  { value: "featured", label: "Destacadas" }
];

// "Mis publicaciones": el dueño ve y gestiona (activar/desactivar, eliminar)
// SUS propias propiedades publicadas, con un resumen de estadísticas arriba
// (ver GET /api/my-properties y /api/my-properties/stats). A diferencia del
// panel admin (rol ADMIN, ve/edita el catálogo entero), esto es self-service:
// el backend resuelve el ownership por el usuario logueado, nunca por un
// parámetro que mande el cliente.
// Texto del diálogo cuando no hay lugar: por qué, cuándo se libera y de cuándo a cuándo quedaría destacada.
function reservationText(availability) {
  const why = availability.blockedBy === "ACCOUNT"
    ? "Ya tenés el máximo de destacados a la vez que permite tu cuenta."
    : "Los lugares de destacados de la plataforma están todos ocupados.";
  return `${why} El primer lugar se libera el ${formatDate(availability.startsAt)}. ¿Aceptás que tu publicación se destaque del ${formatDate(availability.startsAt)} al ${formatDate(availability.endsAt)}? Si preferís no esperar, cancelá y probá más adelante.`;
}

// Resumen de arriba: contadores (con ícono de color) y precios promedio (monto grande, moneda chica).
const TONES = {
  primary: "bg-primary/10 text-primary",
  good: "bg-good-value/10 text-good-value",
  alert: "bg-alert-price/10 text-alert-price",
  muted: "bg-surface-container text-on-surface-variant"
};

function StatCard({ icon: Icon, tone = "primary", label, children }) {
  return <Card>
      <CardContent className="p-4 sm:p-5 flex items-center gap-4">
        <span className={cn("w-11 h-11 rounded-full flex items-center justify-center shrink-0", TONES[tone])}>
          <Icon className="w-5 h-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">{label}</p>
          <div className="mt-0.5">{children}</div>
        </div>
      </CardContent>
    </Card>;
}

// "165.000" grande y "USD" / "ARS por mes" chico al lado; sin dato, un guion.
function PriceValue({ price, operationType }) {
  if (price == null) return <p className="text-3xl font-bold text-on-surface-variant leading-none">—</p>;
  return <p className="flex items-baseline gap-1.5 flex-wrap">
      <span className="text-sm font-bold text-on-surface-variant">{operationType === "SALE" ? "USD" : "ARS"}</span>
      <span className="text-3xl font-bold text-on-surface leading-none">{formatNumber(price)}</span>
      {operationType === "RENT" && <span className="text-sm text-on-surface-variant">/ mes</span>}
    </p>;
}

export default function MisPublicaciones() {
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [sort, setSort] = useState("createdAt-desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Destacados (7 días, rotulados "Destacada"): ids ya destacados y, si no quedan créditos
  // incluidos (402), el pago suelto de USD 8 por la pasarela simulada. Si hoy no hay lugar
  // (plataforma llena o tope de la cuenta) se ofrece RESERVAR para la primera fecha en que se libere uno.
  const { byCode } = useCatalog();
  const featuredIdsFromServer = useFeaturedIds();
  const { summary: billing, refresh: refreshBilling } = useBillingSummary();
  const [justFeaturedIds, setJustFeaturedIds] = useState(() => new Set());
  const [featureCheckout, setFeatureCheckout] = useState(null);
  const [reservation, setReservation] = useState(null);
  const isFeatured = id => featuredIdsFromServer.has(id) || justFeaturedIds.has(id);
  // Reserva propia que todavía no arrancó (startsAt en el futuro), por id de propiedad.
  const reservedFor = id => (billing?.featured?.active ?? []).find(f => f.propertyId === id && new Date(f.startsAt) > new Date()) ?? null;

  function markFeatured(id) {
    invalidateFeaturedIds();
    setJustFeaturedIds(ids => new Set(ids).add(id));
    refreshBilling();
  }

  // Con qué crédito se destacó sin pasar por la pasarela (lo informa el backend en "source").
  const CREDIT_USED = {
    WELCOME: "Usaste tu destacado gratis de bienvenida (sin costo).",
    INCLUDED: "Usaste uno de los destacados incluidos en tu plan (sin costo).",
    PACK: "Usaste un destacado de tu pack (sin costo)."
  };

  // Termina bien: ahora (startsAt null) o como reserva para esa fecha. source = crédito usado (si no fue pago).
  function featuredDone(propertyId, startsAt, source) {
    const credit = CREDIT_USED[source] ? ` ${CREDIT_USED[source]}` : "";
    if (startsAt) {
      refreshBilling();
      toast.success(`Reservaste el destacado: tu publicación se destaca desde el ${formatDate(startsAt)}.${credit}`);
      return;
    }
    markFeatured(propertyId);
    toast.success(`Tu publicación quedó destacada por 7 días.${credit}`);
  }

  async function handleFeature(property) {
    let availability;
    try {
      availability = await getFeaturedAvailability(property.id);
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo destacar la publicación"));
      return;
    }
    if (availability.startsNow) {
      await runFeature(property, null, null);
      return;
    }
    // Hoy no hay lugar: se le pregunta si acepta esperar a la primera fecha libre.
    setReservation({ property, availability });
  }

  async function runFeature(property, startsAt, endsAt) {
    try {
      const activated = await activateFeatured(property.id, startsAt);
      featuredDone(property.id, startsAt, activated?.source);
    } catch (err) {
      if (err.response?.status === 402 && byCode.FEATURED_SINGLE) {
        // Sin destacados incluidos: se ofrece pagar uno suelto.
        toast.info(apiErrorMessage(err, "Ya usaste tus destacados incluidos"));
        setFeatureCheckout({ item: byCode.FEATURED_SINGLE, property, startsAt, endsAt });
        return;
      }
      toast.error(apiErrorMessage(err, "No se pudo destacar la publicación"));
    }
  }

  function acceptReservation() {
    const { property, availability } = reservation;
    setReservation(null);
    runFeature(property, availability.startsAt, availability.endsAt);
  }

  function loadStats() {
    api.get("/api/my-properties/stats").then(res => setStats(res.data)).catch(() => {});
  }

  function loadProperties(targetPage = page, activeValue = activeFilter, sortValue = sort, q = query) {
    setLoading(true);
    setError(null);
    const opt = SORT_OPTIONS.find(o => o.value === sortValue) ?? SORT_OPTIONS[0];
    api.get("/api/my-properties", {
      params: {
        query: q.trim() || undefined,
        // "Destacadas" no es un estado de la publicación: se pide aparte (las que tienen hoy un destacado en curso).
        active: activeValue === "" || activeValue === "featured" ? undefined : activeValue === "true",
        featured: activeValue === "featured" ? true : undefined,
        sortBy: opt.sortBy,
        sortDir: opt.sortDir,
        page: targetPage,
        size: 12
      }
    }).then(res => {
      setProperties(res.data.content);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    }).catch(err => setError(apiErrorMessage(err, "No se pudieron cargar tus publicaciones")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadStats();
    loadProperties(0, activeFilter, sort, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearchSubmit(e) {
    e.preventDefault();
    loadProperties(0, activeFilter, sort, query);
  }

  function handleActiveFilterChange(value) {
    setActiveFilter(value);
    loadProperties(0, value, sort, query);
  }

  function handleSortChange(value) {
    setSort(value);
    loadProperties(0, activeFilter, value, query);
  }

  async function toggleActive(property) {
    try {
      const res = await api.patch(`/api/my-properties/${property.id}/active`, { active: !property.active });
      setProperties(list => list.map(p => (p.id === property.id ? res.data : p)));
      loadStats();
      toast.success(res.data.active ? "Publicación activada" : "Publicación desactivada");
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo actualizar la publicación"));
    }
  }

  async function confirmDelete() {
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`/api/my-properties/${target.id}`);
      setProperties(list => list.filter(p => p.id !== target.id));
      loadStats();
      toast.success("Publicación eliminada");
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo eliminar la publicación"));
    }
  }

  return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6 space-y-1">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Mis publicaciones
        </h1>
        <p className="text-sm text-on-surface-variant font-mono">Gestioná las propiedades que publicaste en Nidio.</p>
      </div>

      {stats && <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Building2} tone="primary" label="Publicadas">
              <p className="text-3xl font-bold text-on-surface leading-none">{stats.totalProperties}</p>
            </StatCard>
            <StatCard icon={CheckCircle2} tone="good" label="Activas">
              <p className="text-3xl font-bold text-on-surface leading-none">{stats.activeCount}</p>
            </StatCard>
            <StatCard icon={EyeOff} tone={stats.inactiveCount > 0 ? "alert" : "muted"} label="Inactivas">
              <p className={cn("text-3xl font-bold leading-none", stats.inactiveCount > 0 ? "text-on-surface" : "text-on-surface-variant")}>{stats.inactiveCount}</p>
            </StatCard>
            <StatCard icon={Heart} tone="primary" label="Favoritos recibidos">
              <p className="text-3xl font-bold text-on-surface leading-none">{stats.totalFavorites}</p>
            </StatCard>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <StatCard icon={Tag} tone="primary" label="Precio promedio · Venta">
              <PriceValue price={stats.avgPriceSale} operationType="SALE" />
            </StatCard>
            <StatCard icon={KeyRound} tone="primary" label="Precio promedio · Alquiler">
              <PriceValue price={stats.avgPriceRent} operationType="RENT" />
            </StatCard>
          </div>
        </div>}

      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 min-w-[200px] relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <Input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar por título, dirección o barrio…" className="pl-9" />
        </form>
        <select value={activeFilter} onChange={e => handleActiveFilterChange(e.target.value)} className="h-10 px-3 rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-bold text-on-surface">
          {ACTIVE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
        </select>
        <select value={sort} onChange={e => handleSortChange(e.target.value)} className="h-10 px-3 rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-bold text-on-surface">
          {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {error && <p className="text-sm font-semibold text-error">{error}</p>}

      {!loading && !error && properties.length === 0 && <div className="text-center py-20 text-on-surface-variant space-y-2">
          <ClipboardList className="w-10 h-10 mx-auto text-outline-variant" />
          {activeFilter !== "" || query.trim()
            ? <p className="font-mono text-sm">{activeFilter === "featured" ? "No tenés publicaciones destacadas en este momento." : "No hay publicaciones que coincidan con el filtro."}</p>
            : <>
                <p className="font-mono text-sm">Todavía no publicaste ninguna propiedad.</p>
                <Link to="/publicar" className="text-primary font-bold hover:underline">Publicar una propiedad</Link>
              </>}
        </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(p => <Card key={p.id} className="overflow-hidden h-full flex flex-col">
            <Link to={`/propiedades/${p.id}`}>
              <div className="h-40 bg-surface-dim relative">
                {p.imageUrls?.[0] && <img src={optimizedImage(p.imageUrls[0], IMG_CARD)} alt={p.title} loading="lazy" className="w-full h-full object-cover" />}
                <Badge className="absolute top-3 right-3 bg-surface-container-lowest/90 backdrop-blur border border-good-value/20 shadow-sm" variant="good">{OPERATION_TYPE_LABEL[p.operationType]}</Badge>
                <Badge
                  className={cn(
                    "absolute top-3 left-3 bg-surface-container-lowest/90 backdrop-blur border shadow-sm",
                    p.active ? "border-primary/20" : "border-alert-price/20"
                  )}
                  variant={p.active ? "default" : "alert"}
                >
                  {p.deactivatedByAdmin ? "Desactivada por admin" : p.active ? "Activa" : "Inactiva"}
                </Badge>
                {isFeatured(p.id) && <FeaturedBadge className="absolute bottom-3 left-3" />}
              </div>
            </Link>
            <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
              <Link to={`/propiedades/${p.id}`} className="space-y-2">
                <h3 className="font-bold text-on-surface line-clamp-2">{p.title}</h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {p.address}, {p.neighborhoodName}
                </p>
                <span className="font-bold text-primary text-lg block">{formatPrice(p.price, p.operationType)}</span>
                <div className="flex flex-wrap gap-3 text-xs font-mono text-on-surface-variant border-t border-outline-variant pt-2">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {PROPERTY_TYPE_LABEL[p.propertyType]}</span>
                  <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {formatNumber(p.surfaceM2)} m²</span>
                  <span className="flex items-center gap-1"><Heart className="w-3 h-3" /> {p.favoriteCount}</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">Publicada el {formatDate(p.createdAt)}</p>
              </Link>

              {p.deactivatedByAdmin && <div className="flex items-start gap-2 rounded-md bg-error-container text-on-error-container text-xs font-semibold px-3 py-2">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Un administrador desactivó esta publicación. Para más información, escribinos a soporte.nidio@gmail.com.</span>
                </div>}

              <div className="flex flex-col gap-2 border-t border-outline-variant pt-3 mt-auto">
                {/* Destacar: botón con texto (una estrella sola no se entiende). Solo para publicaciones activas. */}
                {!p.deactivatedByAdmin && p.active && (isFeatured(p.id)
                  ? <div className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md text-sm font-bold bg-amber-100 text-amber-950 border border-amber-400" title="Esta publicación ya está destacada">
                      <Star className="w-4 h-4 fill-current" /> Publicación destacada
                    </div>
                  : reservedFor(p.id)
                    ? <div className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md text-sm font-bold bg-surface-container-low text-on-surface border border-outline-variant" title="El destacado ya está reservado: arranca solo en esa fecha">
                        <CalendarClock className="w-4 h-4" /> Destacado reservado desde el {formatDate(reservedFor(p.id).startsAt)}
                      </div>
                    : <button
                        type="button"
                        onClick={() => handleFeature(p)}
                        title="Aparece primera en los resultados, con la etiqueta “Destacada”, durante 7 días"
                        className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-md text-sm font-bold transition-colors bg-primary text-on-primary hover:bg-primary-container"
                      >
                        <Star className="w-4 h-4" /> Destacar por 7 días
                      </button>)}
                <div className="flex items-center gap-2">
                  {!p.deactivatedByAdmin && <Button variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => toggleActive(p)}>
                      {p.active ? <><EyeOff className="w-3.5 h-3.5" /> Desactivar</> : <><Eye className="w-3.5 h-3.5" /> Activar</>}
                    </Button>}
                  <Button variant="outline" className={cn("gap-1.5 text-xs text-error border-error/40 hover:bg-error-container", p.deactivatedByAdmin && "flex-1")} onClick={() => setDeleteTarget(p)}>
                    <Trash2 className="w-3.5 h-3.5" /> {p.deactivatedByAdmin && "Eliminar"}
                  </Button>
                  <Link to={`/mis-publicaciones/${p.id}/editar`} aria-label="Editar publicación" title="Editar" className="p-2 rounded-md border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <Link to={`/propiedades/${p.id}`} aria-label="Ver publicación" title="Ver" className="p-2 rounded-md border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {totalPages > 1 && <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" disabled={page === 0} onClick={() => loadProperties(page - 1)}>Anterior</Button>
          <span className="text-xs font-mono text-on-surface-variant">Página {page + 1} de {totalPages}</span>
          <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => loadProperties(page + 1)}>Siguiente</Button>
        </div>}

      {featureCheckout && <CheckoutDialog
        item={featureCheckout.item}
        propertyId={featureCheckout.property.id}
        propertyTitle={featureCheckout.property.title}
        featuredStartsAt={featureCheckout.startsAt}
        featuredEndsAt={featureCheckout.endsAt}
        onClose={() => setFeatureCheckout(null)}
        onApproved={() => featuredDone(featureCheckout.property.id, featureCheckout.startsAt)}
      />}

      <ConfirmDialog
        open={!!reservation}
        title="Hoy no hay lugar para destacar"
        description={reservation ? reservationText(reservation.availability) : ""}
        confirmLabel={reservation ? `Reservar para el ${formatDate(reservation.availability.startsAt)}` : "Reservar"}
        cancelLabel="No, cancelar"
        onConfirm={acceptReservation}
        onCancel={() => setReservation(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar esta publicación?"
        description={deleteTarget ? `"${deleteTarget.title}" se va a eliminar del catálogo. Esta acción no se puede deshacer.` : ""}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>;
}
