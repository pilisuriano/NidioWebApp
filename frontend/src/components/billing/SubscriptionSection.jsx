import { Link } from "react-router-dom";
import { CreditCard, Star, Layers, Receipt, Infinity as InfinityIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/billing/Price";
import { useAuth } from "@/lib/auth";
import { useAllUsage, formatResetDate } from "@/lib/usage";
import { useBillingSummary, PAYMENT_STATUS_LABEL } from "@/lib/billing";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

const FEATURE_LABEL = {
  valuation: "Tasaciones",
  recommendation: "Recomendaciones",
  lifeScore: "Life Score"
};

const SOURCE_LABEL = {
  FREE: "Cuota gratis del mes",
  PASS: "Pase de análisis",
  PLAN: "Plan profesional",
  ADMIN: "Cuenta de administración"
};

// De dónde salió cada destacado activo (el comprado suelto se consume al instante sobre una propiedad: no hay saldo que mostrar).
const FEATURED_SOURCE_LABEL = {
  INCLUDED: "Incluido en tu plan",
  PACK: "De tu pack",
  WELCOME: "Gratis de bienvenida",
  PAID: "Comprado"
};

// "1 comprado · 1 gratis de bienvenida": el cupo simultáneo cuenta todos los orígenes juntos.
const FEATURED_SOURCE_SHORT = { INCLUDED: "del plan", PACK: "de pack", WELCOME: "de bienvenida", PAID: "comprado" };
function activeBreakdown(active, cap) {
  if (!active || active.length === 0) return `Podés tener hasta ${cap} a la vez, sean comprados, de bienvenida o de tu plan`;
  const counts = {};
  active.filter(f => new Date(f.startsAt) <= new Date()).forEach(f => { counts[f.source] = (counts[f.source] ?? 0) + 1; });
  if (Object.keys(counts).length === 0) return `Podés tener hasta ${cap} a la vez, sean comprados, de bienvenida o de tu plan`;
  return Object.entries(counts).map(([source, n]) => `${n} ${FEATURED_SOURCE_SHORT[source] ?? source}`).join(" · ") + ` · máx. ${cap} a la vez`;
}

function ProgressBar({ value, max, danger }) {
  const percent = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return <div className="h-2 w-full rounded-full bg-surface-container overflow-hidden" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max}>
      <div className={cn("h-full rounded-full", danger ? "bg-alert-price" : "bg-primary")} style={{ width: `${percent}%` }} />
    </div>;
}

// Un cuadro grande por función: cuántos usos quedan, cuántos se usaron y hasta cuándo.
function UsageCard({ featureKey, status }) {
  if (!status) return null;
  const label = FEATURE_LABEL[featureKey];
  if (status.unlimited) {
    return <Card><CardContent className="p-5 space-y-2">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-bold text-on-surface flex items-center gap-2"><InfinityIcon className="w-7 h-7" /> Sin límite</p>
        <p className="text-xs font-mono text-on-surface-variant">{status.used} usados · {SOURCE_LABEL.ADMIN}</p>
      </CardContent></Card>;
  }
  const paid = status.source === "PASS" || status.source === "PLAN";
  const exhausted = status.remaining <= 0;
  return <Card className={exhausted ? "border-alert-price/40" : undefined}>
      <CardContent className="p-5 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
          <Badge variant={paid ? "default" : "secondary"}>{SOURCE_LABEL[status.source] ?? status.source}</Badge>
        </div>
        <p className="flex items-baseline gap-2">
          <span className={cn("text-5xl font-bold leading-none", exhausted ? "text-alert-price" : "text-on-surface")}>{status.remaining}</span>
          <span className="text-sm text-on-surface-variant">{status.remaining === 1 ? "disponible" : "disponibles"}</span>
        </p>
        <ProgressBar value={status.used} max={status.limit} danger={exhausted} />
        <p className="text-sm text-on-surface">
          <strong>{status.used}</strong> usados de <strong>{status.limit}</strong>
          {status.extraUses > 0 && <span className="text-on-surface-variant"> (incluye +{status.extraUses} de packs)</span>}
        </p>
        <p className="text-xs font-mono text-on-surface-variant">
          {paid ? `Vence el ${formatResetDate(status.resetsAt)}` : `Se renueva el ${formatResetDate(status.resetsAt)}`}
        </p>
      </CardContent>
    </Card>;
}

function daysLeft(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

function Stat({ label, value, hint }) {
  return <div className="rounded-lg border border-outline-variant bg-surface-container-low p-4">
      <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-on-surface mt-1">{value}</p>
      {hint && <p className="text-xs text-on-surface-variant mt-1">{hint}</p>}
    </div>;
}

/**
 * "Mi suscripción" del perfil: usos del mes por función, plan o pase vigente, packs,
 * publicaciones, destacados e historial de pagos de la pasarela simulada.
 */
export function SubscriptionSection() {
  const { user } = useAuth();
  const { usage } = useAllUsage();
  const { summary, payments, loading, error } = useBillingSummary();
  const isProfessional = user?.accountType === "PROFESSIONAL";

  if (loading) {
    return <p className="text-sm text-on-surface-variant" role="status">Cargando tu suscripción…</p>;
  }
  if (error || !summary) {
    return <p className="text-sm text-on-surface-variant">No pudimos cargar tu suscripción en este momento.</p>;
  }

  const { subscriptions, addons, publications, featured } = summary;
  const nearLimit = publications.limit != null && publications.active >= publications.limit;

  return <section id="suscripcion" className="space-y-8 scroll-mt-6">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-outline-variant pb-4">
        <div>
          <h2 className="text-2xl font-bold text-on-surface flex items-center gap-2"><CreditCard className="w-6 h-6 text-primary" /> Mi suscripción</h2>
          <p className="text-sm font-mono text-on-surface-variant mt-1">Tus planes, tus usos y tus pagos. Los planes no se renuevan solos.</p>
        </div>
        <Link to="/planes" className="inline-flex items-center h-10 px-4 rounded-md bg-primary text-on-primary text-sm font-bold hover:bg-primary-container">
          Ver planes y precios
        </Link>
      </div>

      {/* Usos */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-on-surface">Tus usos</h3>
        <div className={cn("grid grid-cols-1 gap-4", isProfessional ? "md:grid-cols-2" : "md:grid-cols-3")}>
          <UsageCard featureKey="valuation" status={usage?.valuation} />
          {!isProfessional && <UsageCard featureKey="recommendation" status={usage?.recommendation} />}
          <UsageCard featureKey="lifeScore" status={usage?.lifeScore} />
        </div>
      </div>

      {/* Planes y packs vigentes */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Layers className="w-5 h-5" /> Planes y packs vigentes</h3>
        {subscriptions.length === 0 && addons.length === 0
          ? <p className="text-sm text-on-surface-variant">No tenés ningún plan ni pack vigente: estás usando la cuota gratis. <Link to="/planes" className="text-primary font-semibold hover:underline">Conocer los planes</Link></p>
          : <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {subscriptions.map(s => <div key={`${s.kind}-${s.startsAt}`} className="rounded-lg border border-outline-variant p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{s.name}</p>
                    <p className="text-xs font-mono text-on-surface-variant mt-1">Desde el {formatDate(s.startsAt)} · vence el {formatDate(s.expiresAt)}</p>
                  </div>
                  <Badge variant="good">{daysLeft(s.expiresAt)} días</Badge>
                </div>)}
              {addons.map(a => <div key={`${a.type}-${a.expiresAt}`} className="rounded-lg border border-outline-variant p-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-on-surface">{a.name}</p>
                    <p className="text-xs font-mono text-on-surface-variant mt-1">Vence el {formatDate(a.expiresAt)}</p>
                  </div>
                  <Badge variant="secondary">Pack</Badge>
                </div>)}
            </div>}
      </div>

      {/* Publicaciones */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-on-surface">Publicaciones activas</h3>
        <Card><CardContent className="p-5 space-y-3">
          {publications.limit == null
            ? <p className="text-sm text-on-surface"><strong>{publications.active}</strong> activas · sin límite</p>
            : <>
                <p className="text-sm text-on-surface"><strong>{publications.active}</strong> activas de <strong>{publications.limit}</strong> incluidas en tu plan</p>
                <ProgressBar value={publications.active} max={publications.limit} danger={nearLimit} />
                {nearLimit && <p className="text-xs text-on-surface-variant">
                    Llegaste al tope. Para publicar más, <Link to="/planes#duenos" className="text-primary font-semibold hover:underline">mejorá tu plan</Link>.
                  </p>}
              </>}
        </CardContent></Card>
      </div>

      {/* Destacados */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Star className="w-5 h-5" /> Destacados</h3>
        {/* Los incluidos del período y los packs de destacados son de cuentas profesionales: a un dueño particular no se le muestran. */}
        <div className={cn("grid grid-cols-2 gap-3", isProfessional ? "lg:grid-cols-4" : "lg:grid-cols-2")}>
          <Stat label="Activos ahora" value={`${featured.activeCount} de ${featured.accountCap}`} hint={activeBreakdown(featured.active, featured.accountCap)} />
          {isProfessional && <Stat label="Incluidos del período" value={featured.includedPerPeriod > 0 ? `${featured.includedRemaining} de ${featured.includedPerPeriod}` : "—"} hint={featured.includedPerPeriod > 0 ? "No se acumulan" : "Los dan los planes de Inmobiliaria"} />}
          <Stat label="Gratis de bienvenida" value={featured.welcomeAvailable ? "Disponible" : "Ya usado"} hint="Un destacado gratis por cuenta, una sola vez" />
          {isProfessional && <Stat label="Pack sin usar" value={featured.packRemaining} hint="Destacados de tus packs" />}
        </div>
        <p className="text-xs font-mono text-on-surface-variant">
          Lugares de toda la plataforma: {featured.globalActive} de {featured.globalCap} ocupados.
          {featured.nextSlotAt && ` Están todos ocupados: el próximo se libera el ${formatDate(featured.nextSlotAt)}.`}
        </p>
        {featured.active.length > 0 && <ul className="divide-y divide-outline-variant rounded-lg border border-outline-variant">
            {featured.active.map(f => <li key={`${f.propertyId}-${f.endsAt}`} className="p-3 flex items-center justify-between gap-3 text-sm">
                <Link to={`/propiedades/${f.propertyId}`} className="font-semibold text-on-surface hover:underline truncate">{f.title ?? `Propiedad ${f.propertyId}`}</Link>
                <span className="flex items-center gap-2 shrink-0">
                  {new Date(f.startsAt) > new Date() && <Badge variant="outline">Reservado</Badge>}
                  <Badge variant={f.source === "PAID" ? "default" : "secondary"}>{FEATURED_SOURCE_LABEL[f.source] ?? f.source}</Badge>
                  <span className="text-xs font-mono text-on-surface-variant">
                    {new Date(f.startsAt) > new Date() ? `desde el ${formatDate(f.startsAt)} hasta el ${formatDate(f.endsAt)}` : `hasta el ${formatDate(f.endsAt)}`}
                  </span>
                </span>
              </li>)}
          </ul>}
        <p className="text-xs text-on-surface-variant">Para destacar una publicación, usá el botón “Destacar” en <Link to="/mis-publicaciones" className="text-primary font-semibold hover:underline">Mis publicaciones</Link>.</p>
      </div>

      {/* Pagos */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-on-surface flex items-center gap-2"><Receipt className="w-5 h-5" /> Historial de pagos <span className="text-xs font-mono font-normal text-on-surface-variant">(pasarela simulada)</span></h3>
        {payments.length === 0
          ? <p className="text-sm text-on-surface-variant">Todavía no hiciste ninguna compra.</p>
          : <div className="overflow-x-auto rounded-lg border border-outline-variant">
              <table className="w-full text-sm">
                <thead className="bg-surface-container-low text-left text-xs uppercase tracking-wider text-on-surface-variant">
                  <tr><th className="p-3">Fecha</th><th className="p-3">Concepto</th><th className="p-3">Monto</th><th className="p-3">Estado</th></tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {payments.map(p => <tr key={p.id}>
                      <td className="p-3 whitespace-nowrap font-mono text-xs">{formatDate(p.createdAt)}</td>
                      <td className="p-3">{p.description}</td>
                      <td className="p-3"><Price usd={Number(p.amountUsd)} /></td>
                      <td className="p-3"><Badge variant={p.status === "APPROVED" ? "good" : p.status === "REJECTED" ? "alert" : "secondary"}>{PAYMENT_STATUS_LABEL[p.status] ?? p.status}</Badge></td>
                    </tr>)}
                </tbody>
              </table>
            </div>}
      </div>
    </section>;
}
