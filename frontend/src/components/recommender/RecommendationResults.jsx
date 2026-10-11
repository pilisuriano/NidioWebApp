import { useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, Building2, ChevronDown, DoorOpen, ExternalLink, Info, MapPin, Receipt, Ruler, RotateCcw, Pencil, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatPrice, formatNumber, OPERATION_TYPE_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/format";
import { PRICE_STATUS_TEXT, formatDistance, funnelSummary } from "@/lib/recommender";
import { FavoriteButton } from "@/components/property/FavoriteButton";
import { EnvironmentChips } from "@/components/property/EnvironmentChips";
import { usePropertyEnvironment } from "@/lib/environment";
import { useBlueRate } from "@/lib/blueRate";
import { Nidi } from "./Nidi";

// Cuántas tarjetas se ven de entrada; el resto (si la cuenta tiene pase o plan) se muestra con "Ver más".
const FIRST_RESULTS = 3;

const PRICE_BADGE_VARIANT = { IN_RANGE: "good", BELOW: "good", ABOVE: "alert" };

/** Resultado del recomendador: las propiedades que mejor encajan (3, o hasta 10 con pase o plan) con su barrio y por qué encajan (sin puntajes). */
export function RecommendationResults({ result, onEdit, onRestart }) {
  const allItems = result.items ?? [];
  const [expanded, setExpanded] = useState(false);
  // El backend decide cuántas manda: 3 sin pase o plan, hasta 10 con pase o plan. Las 3 primeras son siempre las mismas.
  const hiddenCount = expanded ? 0 : Math.max(0, allItems.length - FIRST_RESULTS);
  const items = hiddenCount > 0 ? allItems.slice(0, FIRST_RESULTS) : allItems;
  const found = items.length > 0;
  // Cuántas más encajan que no se pueden ver con la cuenta actual (sin pase o plan), o que quedaron fuera del tope de 10.
  const notShown = Math.max(0, (result.totalMatches ?? 0) - allItems.length);
  const funnel = funnelSummary(result.funnel);
  const environment = usePropertyEnvironment(items.map(item => item.property.id));
  // Las expensas vienen en USD (como en la ficha) y se muestran en pesos con el dólar blue.
  const { blueRate } = useBlueRate();
  return <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-5">
        <Nidi mode={found ? "happy" : "idle"} width={120} />
        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-bold text-on-surface">
            {found ? (allItems.length === 1 ? "Encontré una propiedad para vos" : `¡Encontré ${allItems.length} lugares para vos!`) : "No encontré propiedades con esas respuestas"}
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
          return <Link key={p.id} to={`/propiedades/${p.id}`} target="_blank" rel="noopener noreferrer" aria-label={`${p.title}, ${p.neighborhoodName}. Se abre en una pestaña nueva`} className="block h-full nidi-pop" style={{ animationDelay: `${Math.min(index, FIRST_RESULTS - 1) * 0.25}s` }}>
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
                  {item.expensesUsd != null && blueRate > 0 && <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 flex-shrink-0" /> Expensas ≈ <strong className="font-bold text-on-surface">ARS {formatNumber(item.expensesUsd * blueRate)} por mes</strong>
                    </p>}
                  {item.workDistanceKm != null && <p className="text-xs text-on-surface-variant flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5 flex-shrink-0" /> A {formatDistance(item.workDistanceKm)} de tu trabajo o estudio (en línea recta)
                    </p>}
                  <p className="text-sm text-on-surface leading-relaxed">{item.explanation}</p>
                  <div className="flex flex-wrap gap-3 text-xs font-mono text-on-surface-variant border-t border-outline-variant pt-2 mt-auto">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {p.rooms} amb.</span>
                    {p.surfaceM2 != null && <span className="flex items-center gap-1"><Ruler className="w-3 h-3" /> {formatNumber(p.surfaceM2)} m²</span>}
                    {p.bathrooms != null && <span className="flex items-center gap-1"><DoorOpen className="w-3 h-3" /> {p.bathrooms} baño{p.bathrooms > 1 ? "s" : ""}</span>}
                  </div>
                  <EnvironmentChips environment={environment[p.id]} />
                  <span className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-on-primary text-sm font-bold">
                    Ver propiedad <ExternalLink className="w-4 h-4" />
                  </span>
                </CardContent>
              </Card>
            </Link>;
        })}
      </div>

      {hiddenCount > 0 && <div className="flex justify-center">
          <Button type="button" variant="outline" className="gap-2" onClick={() => setExpanded(true)}>
            <ChevronDown className="w-4 h-4" /> Ver {hiddenCount === 1 ? "1 propiedad más" : `${hiddenCount} propiedades más`}
          </Button>
        </div>}

      {/* Sin pase o plan: se muestra cuántas más encajan y cómo verlas. El pago amplía la lista, nunca cambia el orden ni la explicación. */}
      {found && !result.moreUnlocked && notShown > 0 && <div role="note" data-testid="more-locked" className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between rounded-lg border border-primary/30 bg-primary/5 p-4">
          <div className="flex gap-3 items-start">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-sm text-on-surface">
              <strong>{notShown === 1 ? "Hay 1 propiedad más que también encaja" : `Hay ${notShown} propiedades más que también encajan`}</strong> con lo que me contaste.
              Con el Pase de análisis ves hasta 10, con el mismo orden y la misma explicación: pagar amplía la lista, no cambia el ranking.
            </p>
          </div>
          <Link to="/planes" className="shrink-0"><Button type="button" size="sm">Ver planes</Button></Link>
        </div>}
      {result.moreUnlocked && hiddenCount === 0 && notShown > 0 && <p className="text-sm text-on-surface-variant text-center">
          Te muestro las {allItems.length} que mejor encajan; hay {notShown} más que también cumplen lo que pediste.
        </p>}

      {funnel.length > 1 && <details className="rounded-lg border border-outline-variant bg-surface-container-low p-4 text-sm text-on-surface">
          <summary className="cursor-pointer font-semibold">¿Cómo llegué a estas?</summary>
          <ol className="mt-3 space-y-1 list-decimal pl-5 marker:text-primary">
            {funnel.map(line => <li key={line}>{line}</li>)}
          </ol>
          <p className="mt-3 text-on-surface-variant">De las que quedaron, te muestro las que mejor encajan con lo que me contaste.</p>
        </details>}

      <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
        <Button type="button" variant="outline" className="gap-2" onClick={onEdit}><Pencil className="w-4 h-4" /> Cambiar mis respuestas</Button>
        <Button type="button" variant="ghost" className="gap-2" onClick={onRestart}><RotateCcw className="w-4 h-4" /> Empezar de nuevo</Button>
      </div>
      <p className="text-xs text-on-surface-variant">
        Es una recomendación orientativa basada en datos públicos y en lo que me contaste; no reemplaza visitar la propiedad. No guardamos tus respuestas.
      </p>
    </div>;
}
