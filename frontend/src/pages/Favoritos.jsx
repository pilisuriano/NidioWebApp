import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Heart, MapPin, Building2, Ruler } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatPrice, formatNumber, OPERATION_TYPE_LABEL } from "@/lib/format";
import { useFavorites } from "@/lib/favorites";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { EnvironmentChips } from "@/components/property/EnvironmentChips";
import { usePropertyEnvironment } from "@/lib/environment";
import { sortProperties, SORT_OPTIONS } from "@/lib/propertyFilters";

// "Mis favoritos": reemplaza a la vieja "Mis búsquedas" (que mostraba
// historial de valuaciones/Life Score). Trae la lista completa una vez
// (GET /api/favorites) y después la filtra en vivo contra el set de IDs
// del contexto — así sacar un favorito desde acá lo saca de la grilla al
// toque, sin tener que refetchear.
export default function Favoritos() {
  const { isFavorite } = useFavorites();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sort, setSort] = useState("");

  useEffect(() => {
    api.get("/api/favorites")
      .then(res => setProperties(res.data))
      .catch(err => setError(apiErrorMessage(err, "No se pudieron cargar tus favoritos")))
      .finally(() => setLoading(false));
  }, []);

  const favorites = sortProperties(properties.filter(p => isFavorite(p.id)), sort);
  const environment = usePropertyEnvironment(favorites.map(p => p.id));

  return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-outline-variant pb-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Heart className="w-6 h-6" /> Mis favoritos
          </h1>
          <p className="text-sm text-on-surface-variant font-mono">
            {loading ? "Cargando…" : `${favorites.length} propiedad${favorites.length === 1 ? "" : "es"} guardada${favorites.length === 1 ? "" : "s"}`}
          </p>
        </div>
        {favorites.length > 0 && <select value={sort} onChange={e => setSort(e.target.value)} className="h-10 px-3 rounded-md border border-outline-variant bg-surface-container-lowest text-sm font-bold text-on-surface">
            {SORT_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>}
      </div>

      {error && <p className="text-sm font-semibold text-error">{error}</p>}

      {!loading && !error && favorites.length === 0 && <div className="text-center py-20 text-on-surface-variant space-y-2">
          <Heart className="w-10 h-10 mx-auto text-outline-variant" />
          <p className="font-mono text-sm">Todavía no marcaste ninguna propiedad como favorita.</p>
          <Link to="/mapa" className="text-primary font-bold hover:underline">Explorar propiedades</Link>
        </div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map(p => {
          // Una publicación guardada puede haber sido desactivada después (por
          // su dueño o por un admin): se marca "Inactiva" y no se linkea al
          // detalle, porque el detalle de una inactiva ya no está disponible.
          // Se puede seguir sacando de favoritos con el corazón.
          const inactive = p.active === false;
          const Wrapper = inactive ? "div" : Link;
          const wrapperProps = inactive ? {} : { to: `/propiedades/${p.id}` };
          return <Card key={p.id} className={cn("overflow-hidden transition-shadow h-full flex flex-col", inactive ? "opacity-80" : "hover:shadow-md")}>
            <Wrapper {...wrapperProps}>
              <div className="h-44 bg-surface-dim relative">
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} className={cn("w-full h-full object-cover", inactive && "grayscale")} />}
                <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                  {typeof p.active === "boolean" && <Badge
                      variant={p.active ? "default" : "alert"}
                      className={cn("bg-surface-container-lowest/90 backdrop-blur border shadow-sm", p.active ? "border-primary/20" : "border-alert-price/20")}
                    >
                      {p.active ? "Activa" : "Inactiva"}
                    </Badge>}
                  <Badge variant="good" className="bg-surface-container-lowest/90 backdrop-blur border border-good-value/20 shadow-sm">{OPERATION_TYPE_LABEL[p.operationType]}</Badge>
                </div>
                <FavoriteButton propertyId={p.id} className="absolute top-3 left-3" />
              </div>
            </Wrapper>
            <CardContent className="p-4 space-y-2 flex-1 flex flex-col">
              <Wrapper {...wrapperProps} className="space-y-2 flex-1 flex flex-col">
                <h3 className="font-bold text-on-surface line-clamp-2">{p.title}</h3>
                <p className="text-xs text-on-surface-variant flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {p.neighborhoodName}
                </p>
                <span className="font-bold text-primary text-lg">{formatPrice(p.price, p.operationType)}</span>
                {inactive && <p className="text-xs font-semibold text-alert-price">Esta publicación ya no está disponible.</p>}
                <div className="flex flex-wrap gap-3 text-xs font-mono text-on-surface-variant border-t border-outline-variant pt-2 mt-auto">
                  <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.rooms} amb.</span>
                  <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {formatNumber(p.surfaceM2)} m²</span>
                </div>
                <EnvironmentChips environment={environment[p.id]} />
              </Wrapper>
            </CardContent>
          </Card>;
        })}
      </div>
    </div>;
}
