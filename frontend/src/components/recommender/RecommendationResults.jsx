import { Link } from "react-router-dom";
import { Briefcase, Building2, DoorOpen, ExternalLink, Info, MapPin, Ruler, RotateCcw, Pencil } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatNumber, OPERATION_TYPE_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/format";
import { PRICE_STATUS_TEXT, formatDistance } from "@/lib/recommender";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { Nidi } from "./Nidi";

const PRICE_BADGE_VARIANT = { IN_RANGE: "good", BELOW: "good", ABOVE: "alert" };

/** Resultado del recomendador: hasta 3 propiedades con su barrio y por qué encajan (sin puntajes). */
export function RecommendationResults({ result, onEdit, onRestart }) {
  const items = result.items ?? [];
  const found = items.length > 0;
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <Nidi mode={found ? "happy" : "idle"} width={120} />
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-on-surface">
            {found ? (items.length === 1 ? "Encontré una propiedad para vos" : `¡Encontré ${items.length} lugares para vos!`) : "No encontré propiedades con esas respuestas"}
          </h2>
          <p className="text-sm text-on-surface-variant">
            {found ? "Estas son las que mejor encajan con lo que me contaste, y por qué." : "Probá cambiar el presupuesto, el tipo de lugar o con quién vivís."}
          </p>
        </div>
      </div>

      {result.message && <div role="note" className="flex gap-3 items-start rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface">
          <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          <p>{result.message}</p>
        </div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {items.map((item, index) => {
          const p = item.property;
          const priceText = PRICE_STATUS_TEXT[item.priceStatus];
          // Toda la tarjeta es un enlace que abre la propiedad en una pestaña nueva, para no perder los resultados.
          // El corazón de favoritos frena el clic (ver FavoriteButton), así que no abre la propiedad.
          return <Link key={p.id} to={`/propiedades/${p.id}`} target="_blank" rel="noopener noreferrer" aria-label={`${p.title}, ${p.neighborhoodName}. Se abre en una pestaña nueva`} className="block h-full nidi-pop" style={{ animationDelay: `${index * 0.25}s` }}>
              <Card className="overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-44 bg-surface-dim relative">
                  {p.imageUrl && <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />}
                  <FavoriteButton propertyId={p.id} className="absolute top-3 left-3" />
                  <span className="absolute bottom-3 left-3 w-8 h-8 rounded-full bg-primary text-on-primary text-sm font-bold flex items-center justify-center shadow">{index + 1}</span>
                  <Badge className="absolute top-3 right-3 bg-surface-container-lowest border border-good-value/20 shadow-sm" variant="good">{OPERATION_TYPE_LABEL[p.operationType]}</Badge>
                </div>
                <CardContent className="p-4 space-y-3 flex-1 flex flex-col">
                  <div className="space-y-1">
                    <h3 className="font-bold text-on-surface line-clamp-2">{p.title}</h3>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {p.neighborhoodName} · {PROPERTY_TYPE_LABEL[p.propertyType] ?? p.propertyType}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-bold text-primary text-lg">{formatPrice(p.price, p.operationType)}</span>
                    {priceText && <Badge variant={PRICE_BADGE_VARIANT[item.priceStatus]}>{priceText}</Badge>}
                  </div>
                  {item.workDistanceKm != null && <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" /> A {formatDistance(item.workDistanceKm)} de tu trabajo o estudio (en línea recta)
                    </p>}
                  <p className="text-sm text-on-surface leading-relaxed">{item.explanation}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-mono text-on-surface-variant border-t border-outline-variant pt-2 mt-auto">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.rooms} amb.</span>
                    {p.surfaceM2 != null && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {formatNumber(p.surfaceM2)} m²</span>}
                    {p.bathrooms != null && <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {p.bathrooms} baño{p.bathrooms > 1 ? "s" : ""}</span>}
                  </div>
                  <span className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-on-primary text-sm font-bold">
                    Ver propiedad <ExternalLink className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>;
        })}
      </div>

      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        <Button type="button" variant="outline" className="gap-2" onClick={onEdit}><Pencil className="w-4 h-4" /> Cambiar mis respuestas</Button>
        <Button type="button" variant="ghost" className="gap-2" onClick={onRestart}><RotateCcw className="w-4 h-4" /> Empezar de nuevo</Button>
      </div>
      <p className="text-xs text-on-surface-variant">
        Es una recomendación orientativa basada en datos públicos y en lo que me contaste; no reemplaza visitar la propiedad. No guardamos tus respuestas.
      </p>
    </div>;
}
