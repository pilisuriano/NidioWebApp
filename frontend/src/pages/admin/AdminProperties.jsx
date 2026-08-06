import { useEffect, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Pencil, MapPin, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { api, apiErrorMessage } from "@/lib/api";
import { formatPrice, formatNumber, PROPERTY_TYPE_LABEL, OPERATION_TYPE_LABEL } from "@/lib/format";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

const ACTIVE_FILTERS = [
  { value: "ALL", label: "Todas" },
  { value: "ACTIVE", label: "Activas" },
  { value: "INACTIVE", label: "Desactivadas" }
];

const PUBLISHER_TYPES = [{ value: "OWNER", label: "Dueño directo" }, { value: "AGENCY", label: "Inmobiliaria" }];

const ORIENTATIONS = [{ value: "", label: "Sin especificar" }, { value: "Frente", label: "Frente" }, { value: "Contrafrente", label: "Contrafrente" }, { value: "Interno", label: "Interno" }, { value: "Lateral", label: "Lateral" }];

const SORT_OPTIONS = [
  { value: "createdAt,desc", label: "Más recientes" },
  { value: "createdAt,asc", label: "Más antiguas" },
  { value: "price,desc", label: "Precio: mayor a menor" },
  { value: "price,asc", label: "Precio: menor a mayor" },
  { value: "surfaceM2,desc", label: "Superficie: mayor a menor" },
  { value: "title,asc", label: "Título: A-Z" }
];

function EditPropertyModal({ property, neighborhoods, onClose, onSaved }) {
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!property) return;
    api.get(`/api/admin/properties/${property.id}`).then(res => {
      const p = res.data;
      setForm({
        propertyType: p.propertyType,
        operationType: p.operationType,
        publisherType: p.publisherType ?? "OWNER",
        neighborhoodId: String(p.neighborhood.id),
        address: p.address,
        surfaceM2: String(p.surfaceM2),
        totalSurfaceM2: p.totalSurfaceM2 != null ? String(p.totalSurfaceM2) : "",
        rooms: p.rooms,
        bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
        ageYears: p.ageYears != null ? String(p.ageYears) : "",
        orientation: p.orientation ?? "",
        price: String(p.price),
        imageUrls: p.imageUrls ?? [],
        description: p.description ?? ""
      });
    }).catch(err => setError(apiErrorMessage(err, "No se pudo cargar la propiedad")));
  }, [property]);

  if (!property) return null;

  function update(field, value) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleSave() {
    setError(null);
    setSaving(true);
    try {
      await api.put(`/api/admin/properties/${property.id}`, {
        propertyType: form.propertyType,
        operationType: form.operationType,
        neighborhoodId: Number(form.neighborhoodId),
        address: form.address.trim(),
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
      toast.success("Propiedad actualizada");
      onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo guardar los cambios"));
    } finally {
      setSaving(false);
    }
  }

  return <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-bold text-on-surface">Editar propiedad</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface"><X className="w-5 h-5" /></button>
        </div>

        {!form ? <p className="text-sm text-on-surface-variant font-mono">Cargando…</p> : <>
            {error && <p className="text-sm text-error">{error}</p>}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Operación</label>
                <select value={form.operationType} onChange={e => update("operationType", e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm">
                  <option value="SALE">Venta</option>
                  <option value="RENT">Alquiler</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Tipo</label>
                <select value={form.propertyType} onChange={e => update("propertyType", e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm">
                  <option value="APARTMENT">Departamento</option>
                  <option value="HOUSE">Casa</option>
                  <option value="PH">PH</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline uppercase tracking-widest">Barrio</label>
              <select value={form.neighborhoodId} onChange={e => update("neighborhoodId", e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm">
                {neighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline uppercase tracking-widest">Dirección</label>
              <Input value={form.address} onChange={e => update("address", e.target.value)} />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">m² tot.</label>
                <Input type="number" min={1} value={form.surfaceM2} onChange={e => update("surfaceM2", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Ambientes</label>
                <Input type="number" min={1} value={form.rooms} onChange={e => update("rooms", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Precio</label>
                <Input type="number" min={0} value={form.price} onChange={e => update("price", e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">¿Quién publica?</label>
                <select value={form.publisherType} onChange={e => update("publisherType", e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm">
                  {PUBLISHER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Orientación</label>
                <select value={form.orientation} onChange={e => update("orientation", e.target.value)} className="w-full h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm">
                  {ORIENTATIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">m² cub.</label>
                <Input type="number" min={0} value={form.totalSurfaceM2} onChange={e => update("totalSurfaceM2", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Baños</label>
                <Input type="number" min={0} value={form.bathrooms} onChange={e => update("bathrooms", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-outline uppercase tracking-widest">Antigüedad</label>
                <Input type="number" min={0} value={form.ageYears} onChange={e => update("ageYears", e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline uppercase tracking-widest">Fotos</label>
              <ImageUploader images={form.imageUrls} onChange={urls => update("imageUrls", urls)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-outline uppercase tracking-widest">Descripción</label>
              <textarea rows={3} value={form.description} onChange={e => update("description", e.target.value)} className="w-full rounded-md border border-outline-variant bg-surface-container-lowest px-3 py-2 text-sm resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleSave} disabled={saving}>{saving ? "Guardando…" : "Guardar cambios"}</Button>
            </div>
          </>}
      </div>
    </div>;
}

export default function AdminProperties() {
  const [properties, setProperties] = useState([]);
  const [neighborhoods, setNeighborhoods] = useState([]);
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [sort, setSort] = useState("createdAt,desc");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editTarget, setEditTarget] = useState(null);

  useEffect(() => {
    api.get("/api/neighborhoods").then(res => setNeighborhoods(res.data)).catch(() => {});
  }, []);

  function loadProperties(targetPage = page, search = query, activeValue = activeFilter, sortValue = sort) {
    setLoading(true);
    const [sortBy, sortDir] = sortValue.split(",");
    const active = activeValue === "ALL" ? undefined : activeValue === "ACTIVE";
    api.get("/api/admin/properties", { params: { query: search || undefined, active, sortBy, sortDir, page: targetPage, size: PAGE_SIZE } })
      .then(res => {
        setProperties(res.data.content);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      })
      .catch(err => toast.error(apiErrorMessage(err, "No se pudieron cargar las propiedades")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProperties(0, query, activeFilter, sort);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadProperties(0, query, activeFilter, sort);
  }

  function handleActiveFilterChange(value) {
    setActiveFilter(value);
    loadProperties(0, query, value, sort);
  }

  function handleSortChange(value) {
    setSort(value);
    loadProperties(0, query, activeFilter, value);
  }

  async function handleActivate(property) {
    try {
      await api.patch(`/api/admin/properties/${property.id}/active`, { active: true });
      toast.success("Propiedad reactivada");
      loadProperties();
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo reactivar la propiedad"));
    }
  }

  async function handleConfirmDeactivate() {
    const target = deactivateTarget;
    setDeactivateTarget(null);
    try {
      await api.patch(`/api/admin/properties/${target.id}/active`, { active: false });
      toast.success("Propiedad desactivada");
      loadProperties();
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo desactivar la propiedad"));
    }
  }

  async function handleConfirmDelete() {
    const target = deleteTarget;
    setDeleteTarget(null);
    try {
      await api.delete(`/api/admin/properties/${target.id}`);
      toast.success("Propiedad eliminada");
      loadProperties();
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo eliminar la propiedad"));
    }
  }

  return <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Propiedades</h1>
        <p className="text-sm font-mono text-on-surface-variant">Catálogo completo: sintéticas y publicadas por usuarios.</p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <form onSubmit={handleSearch} className="max-w-sm flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
            <Input type="text" placeholder="Buscar por título, dirección o barrio" className="pl-10" value={query} onChange={e => setQuery(e.target.value)} />
          </div>
        </form>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-outline uppercase tracking-widest">Estado</label>
          <select value={activeFilter} onChange={e => handleActiveFilterChange(e.target.value)} className="h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary">
            {ACTIVE_FILTERS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-outline uppercase tracking-widest">Ordenar por</label>
          <select value={sort} onChange={e => handleSortChange(e.target.value)} className="h-10 rounded-md border border-outline-variant bg-surface-container-lowest px-3 text-sm text-on-surface outline-none focus:border-primary">
            {SORT_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-left text-xs uppercase tracking-widest text-outline">
                <th className="p-4 font-semibold">Propiedad</th>
                <th className="p-4 font-semibold">Tipo</th>
                <th className="p-4 font-semibold">Precio</th>
                <th className="p-4 font-semibold">Publicada por</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-mono text-sm">Cargando…</td></tr>}
              {!loading && properties.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-mono text-sm">No se encontraron propiedades.</td></tr>}
              {!loading && properties.map(p => <tr key={p.id} className="border-b border-outline-variant last:border-0">
                  <td className="p-4">
                    <div className="font-semibold text-on-surface">{p.title}</div>
                    <div className="text-xs text-on-surface-variant flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" /> {p.address}, {p.neighborhoodName}</div>
                  </td>
                  <td className="p-4 text-xs font-mono text-on-surface-variant">
                    {PROPERTY_TYPE_LABEL[p.propertyType]} · {OPERATION_TYPE_LABEL[p.operationType]}
                    <br />{formatNumber(p.surfaceM2)} m² · {p.rooms} amb.
                  </td>
                  <td className="p-4 text-sm font-bold text-primary">{formatPrice(p.price, p.operationType)}</td>
                  <td className="p-4 text-xs text-on-surface-variant">{p.createdByName ?? "Catálogo sintético"}</td>
                  <td className="p-4">
                    <Badge variant={p.active ? "good" : "alert"}>{p.active ? "Activa" : "Desactivada"}</Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => setEditTarget(p)}><Pencil className="w-3.5 h-3.5" /></Button>
                      {p.active
                        ? <Button variant="outline" size="sm" onClick={() => setDeactivateTarget(p)}>Desactivar</Button>
                        : <Button variant="outline" size="sm" onClick={() => handleActivate(p)}>Reactivar</Button>}
                      <Button variant="ghost" size="sm" className="text-error hover:text-error" onClick={() => setDeleteTarget(p)}>Eliminar</Button>
                    </div>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {totalPages > 1 && <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => loadProperties(page - 1)}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <span className="text-xs font-mono text-on-surface-variant">Página {page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => loadProperties(page + 1)}>
            Siguiente <ChevronRight className="w-4 h-4" />
          </Button>
        </div>}

      <ConfirmDialog
        open={!!deactivateTarget}
        title="¿Desactivar propiedad?"
        description={deactivateTarget ? `"${deactivateTarget.title}" deja de verse en el catálogo público hasta que la reactives.` : ""}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="¿Eliminar propiedad?"
        description={deleteTarget ? `Esta acción no se puede deshacer: se borra "${deleteTarget.title}" permanentemente.` : ""}
        confirmLabel="Eliminar"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      <EditPropertyModal
        property={editTarget}
        neighborhoods={neighborhoods}
        onClose={() => setEditTarget(null)}
        onSaved={() => { setEditTarget(null); loadProperties(); }}
      />
    </div>;
}
