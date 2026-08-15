import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Search, MapPin, Building2, DoorOpen, Ruler, SlidersHorizontal, ChevronLeft, ChevronRight, X, Map } from "lucide-react";
import { api } from "@/lib/api";
import { formatPrice, formatNumber, OPERATION_TYPE_LABEL } from "@/lib/format";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import {
  filterProperties, countActiveFilters, fetchAllProperties, parseFilterQueryString, sortProperties, buildFilterQueryString,
  ROOMS_OPTIONS, BATHROOMS_OPTIONS, AGE_OPTIONS, PUBLISHER_TYPE_OPTIONS, ORIENTATION_OPTIONS, AMENITY_OPTIONS, SORT_OPTIONS
} from "@/lib/propertyFilters";
import { cn } from "@/lib/utils";

const PROPERTY_TYPE_OPTIONS = [["", "Todos los tipos"], ["APARTMENT", "Departamento"], ["HOUSE", "Casa"], ["PH", "PH"]];
const PAGE_SIZE = 12;

// Página de listado completo, tipo Zonaprop: mismos filtros que el mapa
// (llega acá con los que ya estaban activos, vía query string — ver
// buildFilterQueryString en MapPage), pero en formato grilla paginada en
// vez de pines. Reusa filterProperties/fetchAllProperties para que el
// resultado sea siempre consistente con lo que se ve en el mapa.
export default function PropertyListing() {
  const [searchParams] = useSearchParams();
  const initial = parseFilterQueryString(searchParams);

  const [operationType, setOperationType] = useState(initial.operationType);
  const [propertyType, setPropertyType] = useState(initial.propertyType);
  const [search, setSearch] = useState(initial.search);
  const [minRooms, setMinRooms] = useState(initial.minRooms);
  const [minBathrooms, setMinBathrooms] = useState(initial.minBathrooms);
  const [priceFrom, setPriceFrom] = useState(initial.priceFrom);
  const [priceTo, setPriceTo] = useState(initial.priceTo);
  const [ageFilter, setAgeFilter] = useState(initial.ageFilter);
  const [publisherTypeFilter, setPublisherTypeFilter] = useState(initial.publisherType);
  const [orientationFilter, setOrientationFilter] = useState(initial.orientations);
  const [amenityFilter, setAmenityFilter] = useState(initial.amenities);
  const [amenityInput, setAmenityInput] = useState("");
  const [sort, setSort] = useState(initial.sort);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    setLoading(true);
    const baseParams = {
      operationType,
      ...(propertyType ? { propertyType } : {})
    };
    fetchAllProperties(api, baseParams)
      .then(setProperties)
      .catch(() => setProperties([]))
      .finally(() => setLoading(false));
  }, [operationType, propertyType]);

  useEffect(() => {
    // Cualquier cambio de filtro u orden vuelve a la primera página.
    setPage(0);
  }, [operationType, propertyType, search, minRooms, minBathrooms, priceFrom, priceTo, ageFilter, publisherTypeFilter, orientationFilter, amenityFilter, sort]);

  const activeFilters = { minRooms, minBathrooms, priceFrom, priceTo, ageFilter, publisherType: publisherTypeFilter, orientations: orientationFilter, amenities: amenityFilter };
  const activeFilterCount = countActiveFilters(activeFilters);
  const filtered = sortProperties(filterProperties(properties, { search, ...activeFilters }), sort);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);
  // Mismos filtros ya aplicados acá, para que el mapa quede igual como se
  // dejó (ver el link "Volver al mapa" en el header).
  const mapQueryString = buildFilterQueryString({ operationType, propertyType, search, ...activeFilters, sort });

  function clearFilters() {
    setMinRooms(0);
    setMinBathrooms(0);
    setPriceFrom("");
    setPriceTo("");
    setAgeFilter("");
    setPublisherTypeFilter("");
    setOrientationFilter([]);
    setAmenityFilter([]);
    setAmenityInput("");
  }
  function toggleAmenity(tag) {
    setAmenityFilter(list => list.some(t => t.toLowerCase() === tag.toLowerCase())
      ? list.filter(t => t.toLowerCase() !== tag.toLowerCase())
      : [...list, tag]);
  }
  function addCustomAmenity(e) {
    e.preventDefault();
    const tag = amenityInput.trim();
    if (!tag) return;
    if (!amenityFilter.some(t => t.toLowerCase() === tag.toLowerCase())) {
      setAmenityFilter(list => [...list, tag]);
    }
    setAmenityInput("");
  }
  const customAmenities = amenityFilter.filter(t => !AMENITY_OPTIONS.some(o => o.toLowerCase() === t.toLowerCase()));

  return <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-start justify-between gap-4 mt-8">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-on-surface">Listado de propiedades</h1>
          <p className="text-sm text-on-surface-variant font-mono">
            {loading ? "Cargando…" : `${filtered.length} propiedad${filtered.length === 1 ? "" : "es"} encontrada${filtered.length === 1 ? "" : "s"}`}
          </p>
        </div>
        <Link to={`/mapa?${mapQueryString}`} className="flex items-center gap-2 shrink-0 px-4 py-2 rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-bold text-on-surface hover:bg-surface-dim transition-colors">
          <Map className="w-4 h-4" /> Volver al mapa
        </Link>
      </div>

      {/* Barra de filtros */}
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex rounded-md border border-outline-variant p-1 bg-surface-container-low">
            {[["RENT", "Alquilar"], ["SALE", "Comprar"]].map(([op, label]) => <button key={op} type="button" onClick={() => setOperationType(op)} className={cn("px-4 py-2 rounded text-sm transition-all", operationType === op ? "font-bold bg-primary text-on-primary shadow-sm" : "font-medium text-on-surface-variant hover:text-on-surface")}>
                {label}
              </button>)}
          </div>
          <select value={propertyType} onChange={e => setPropertyType(e.target.value)} className="h-10 px-3 rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-bold text-on-surface">
            {PROPERTY_TYPE_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-outline" />
            <Input type="text" placeholder="Barrio, dirección, ambientes, pileta, cochera..." className="pl-10 pr-9" value={search} onChange={e => setSearch(e.target.value)} />
            {search && <button type="button" onClick={() => setSearch("")} aria-label="Borrar búsqueda" className="absolute right-2.5 top-2.5 text-outline hover:text-on-surface">
                <X className="w-5 h-5" />
              </button>}
          </div>
          <Button type="button" variant="outline" className="gap-2 relative shrink-0" onClick={() => setFiltersOpen(v => !v)}>
            <SlidersHorizontal className="w-4 h-4" /> Más filtros
            {activeFilterCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-alert-price text-white text-[10px] font-bold flex items-center justify-center">{activeFilterCount}</span>}
          </Button>
          <select value={sort} onChange={e => setSort(e.target.value)} className="h-10 px-3 rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-bold text-on-surface shrink-0">
            {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>

        {filtersOpen && <Card>
            <CardContent className="p-5 grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Ambientes</p>
                <div className="flex gap-2">
                  {ROOMS_OPTIONS.map(n => <button key={n} type="button" onClick={() => setMinRooms(n)} className={cn("flex-1 text-sm py-1.5 rounded-md border transition-colors", minRooms === n ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                      {n === 0 ? "Todos" : `${n}+`}
                    </button>)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Baños</p>
                <div className="flex gap-2">
                  {BATHROOMS_OPTIONS.map(n => <button key={n} type="button" onClick={() => setMinBathrooms(n)} className={cn("flex-1 text-sm py-1.5 rounded-md border transition-colors", minBathrooms === n ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                      {n === 0 ? "Todos" : `${n}+`}
                    </button>)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Precio</p>
                <div className="flex gap-2">
                  <Input type="number" min={0} placeholder="Desde" value={priceFrom} onChange={e => setPriceFrom(e.target.value)} />
                  <Input type="number" min={0} placeholder="Hasta" value={priceTo} onChange={e => setPriceTo(e.target.value)} />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Antigüedad</p>
                <div className="flex flex-wrap gap-2">
                  {AGE_OPTIONS.map(([value, label]) => <button key={value} type="button" onClick={() => setAgeFilter(value)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", ageFilter === value ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                      {label}
                    </button>)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Tipo de anunciante</p>
                <div className="flex flex-wrap gap-2">
                  {PUBLISHER_TYPE_OPTIONS.map(([value, label]) => <button key={value} type="button" onClick={() => setPublisherTypeFilter(value)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", publisherTypeFilter === value ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                      {label}
                    </button>)}
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Orientación</p>
                <div className="flex flex-wrap gap-2">
                  {ORIENTATION_OPTIONS.map(o => <button key={o} type="button" onClick={() => setOrientationFilter(list => list.includes(o) ? list.filter(x => x !== o) : [...list, o])} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", orientationFilter.includes(o) ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                      {o}
                    </button>)}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <p className="text-xs font-bold text-outline uppercase tracking-widest">Características</p>
                <div className="flex flex-wrap gap-2">
                  {AMENITY_OPTIONS.map(tag => <button key={tag} type="button" onClick={() => toggleAmenity(tag)} className={cn("text-sm px-3 py-1.5 rounded-md border transition-colors", amenityFilter.some(t => t.toLowerCase() === tag.toLowerCase()) ? "border-primary bg-primary/10 text-primary font-bold" : "border-outline-variant text-on-surface-variant hover:border-outline")}>
                      {tag}
                    </button>)}
                </div>
                <form onSubmit={addCustomAmenity} className="flex gap-2">
                  <Input type="text" placeholder="Ej.: pileta, balcón, permite mascotas…" value={amenityInput} onChange={e => setAmenityInput(e.target.value)} />
                  <Button type="submit" size="sm" variant="outline" className="shrink-0">Agregar</Button>
                </form>
                {customAmenities.length > 0 && <div className="flex flex-wrap gap-2">
                    {customAmenities.map(tag => <span key={tag} className="flex items-center gap-1 text-xs font-semibold pl-2.5 pr-1.5 py-1 rounded-full bg-primary/10 text-primary">
                        {tag}
                        <button type="button" onClick={() => setAmenityFilter(list => list.filter(t => t !== tag))} aria-label={`Quitar ${tag}`} className="hover:opacity-70">
                          <X className="w-3 h-3" />
                        </button>
                      </span>)}
                  </div>}
              </div>

              <div className="md:col-span-2 flex justify-between items-center pt-2 border-t border-outline-variant">
                <button type="button" onClick={clearFilters} className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">
                  Limpiar filtros
                </button>
                <Button type="button" size="sm" onClick={() => setFiltersOpen(false)}>Ver resultados</Button>
              </div>
            </CardContent>
          </Card>}
      </div>

      {/* Grilla de resultados */}
      {!loading && filtered.length === 0 && <div className="text-center py-20 text-on-surface-variant font-mono text-sm">
          No hay propiedades que coincidan con estos filtros.
        </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {pageItems.map(p => <Link key={p.id} to={`/propiedades/${p.id}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full flex flex-col">
              <div className="h-44 bg-surface-dim relative">
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
                <Badge className="absolute top-3 right-3" variant="good">{OPERATION_TYPE_LABEL[p.operationType]}</Badge>
                <FavoriteButton propertyId={p.id} className="absolute top-3 left-3" />
              </div>
              <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
                <h3 className="font-bold text-on-surface line-clamp-2">{p.title}</h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {p.neighborhoodName}
                </p>
                <span className="font-bold text-primary text-lg">{formatPrice(p.price, p.operationType)}</span>
                <div className="flex flex-wrap gap-3 text-xs font-mono text-on-surface-variant border-t border-outline-variant pt-2 mt-auto">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.rooms} amb.</span>
                  <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {formatNumber(p.surfaceM2)} m²</span>
                  {p.bathrooms != null && <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {p.bathrooms} baño{p.bathrooms > 1 ? "s" : ""}</span>}
                </div>
              </CardContent>
            </Card>
          </Link>)}
      </div>

      {/* Paginado */}
      {totalPages > 1 && <div className="flex items-center justify-center gap-4 pt-4">
          <Button type="button" variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))} className="gap-1">
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <span className="text-sm font-mono text-on-surface-variant">Página {page + 1} de {totalPages}</span>
          <Button type="button" variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} className="gap-1">
            Siguiente <ChevronRight className="w-4 h-4" />
          </Button>
        </div>}
    </div>;
}
