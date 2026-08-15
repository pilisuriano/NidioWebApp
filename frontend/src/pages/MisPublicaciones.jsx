import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ClipboardList, Search, MapPin, Building2, Ruler, Heart, Eye, EyeOff, Trash2, ExternalLink, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { api, apiErrorMessage } from "@/lib/api";
import { formatPrice, formatNumber, formatDate, PROPERTY_TYPE_LABEL, OPERATION_TYPE_LABEL } from "@/lib/format";
import { cn } from "@/lib/utils";

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
  { value: "false", label: "Inactivas" }
];

// "Mis publicaciones": el dueño ve y gestiona (activar/desactivar, eliminar)
// SUS propias propiedades publicadas, con un resumen de estadísticas arriba
// (ver GET /api/my-properties y /api/my-properties/stats). A diferencia del
// panel admin (rol ADMIN, ve/edita el catálogo entero), esto es self-service:
// el backend resuelve el ownership por el usuario logueado, nunca por un
// parámetro que mande el cliente.
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
        active: activeValue === "" ? undefined : activeValue === "true",
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

  const statTiles = stats && [
    { label: "Publicadas", value: stats.totalProperties },
    { label: "Activas", value: stats.activeCount },
    { label: "Inactivas", value: stats.inactiveCount },
    { label: "Favoritos recibidos", value: stats.totalFavorites },
    { label: "Precio prom. venta", value: stats.avgPriceSale != null ? formatPrice(stats.avgPriceSale, "SALE") : "—" },
    { label: "Precio prom. alquiler", value: stats.avgPriceRent != null ? formatPrice(stats.avgPriceRent, "RENT") : "—" }
  ];

  return <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6 space-y-1">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          <ClipboardList className="w-6 h-6" /> Mis publicaciones
        </h1>
        <p className="text-sm text-on-surface-variant font-mono">Gestioná las propiedades que publicaste en Nidio.</p>
      </div>

      {statTiles && <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statTiles.map(tile => <Card key={tile.label}>
              <CardContent className="p-4 space-y-1">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">{tile.label}</p>
                <p className="text-xl font-bold text-on-surface">{tile.value}</p>
              </CardContent>
            </Card>)}
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
          <p className="font-mono text-sm">Todavía no publicaste ninguna propiedad.</p>
          <Link to="/publicar" className="text-primary font-bold hover:underline">Publicar una propiedad</Link>
        </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map(p => <Card key={p.id} className="overflow-hidden h-full flex flex-col">
            <Link to={`/propiedades/${p.id}`}>
              <div className="h-40 bg-surface-dim relative">
                {p.imageUrls?.[0] && <img src={p.imageUrls[0]} alt={p.title} className="w-full h-full object-cover" />}
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

              <div className="flex items-center gap-2 border-t border-outline-variant pt-3 mt-auto">
                {!p.deactivatedByAdmin && <Button variant="outline" className="flex-1 gap-1.5 text-xs" onClick={() => toggleActive(p)}>
                    {p.active ? <><EyeOff className="w-3.5 h-3.5" /> Desactivar</> : <><Eye className="w-3.5 h-3.5" /> Activar</>}
                  </Button>}
                <Button variant="outline" className={cn("gap-1.5 text-xs text-error border-error/40 hover:bg-error-container", p.deactivatedByAdmin && "flex-1")} onClick={() => setDeleteTarget(p)}>
                  <Trash2 className="w-3.5 h-3.5" /> {p.deactivatedByAdmin && "Eliminar"}
                </Button>
                <Link to={`/propiedades/${p.id}`} className="p-2 rounded-md border border-outline-variant text-on-surface-variant hover:text-primary hover:border-primary transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>)}
      </div>

      {totalPages > 1 && <div className="flex items-center justify-center gap-3 pt-2">
          <Button variant="outline" disabled={page === 0} onClick={() => loadProperties(page - 1)}>Anterior</Button>
          <span className="text-xs font-mono text-on-surface-variant">Página {page + 1} de {totalPages}</span>
          <Button variant="outline" disabled={page >= totalPages - 1} onClick={() => loadProperties(page + 1)}>Siguiente</Button>
        </div>}

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
