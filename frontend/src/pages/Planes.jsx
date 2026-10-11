import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Building2, Check, Home, Info, Search, Sparkles, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/billing/Price";
import { CheckoutDialog } from "@/components/billing/CheckoutDialog";
import { useAuth } from "@/lib/auth";
import { useCatalog } from "@/lib/billing";
import { useCardRate, formatArs } from "@/lib/cardRate";
import { PLAN_TABS, defaultTabFor, tabFromHash } from "@/lib/planesTabs";
import { cn } from "@/lib/utils";

/**
 * Planes y precios (modelo de negocio). Explorar, buscar y ver mapas es gratis;
 * se paga por más análisis (Pase de análisis y packs), por publicar más (planes de
 * dueño y profesionales) y por destacar. Pasarela de pagos SIMULADA.
 *
 * La página se divide en pestañas por tipo de usuario (busco / dueño / profesional) para no
 * mostrar todo junto. La pestaña viaja en el hash de la URL (/planes#packs abre "Busco propiedad").
 */

const TAB_ICONS = { busco: Search, duenos: Home, profesionales: Building2 };

function Section({ id, title, subtitle, children }) {
  return <section id={id} className="space-y-4 scroll-mt-6">
      <div>
        <h2 className="text-xl font-bold text-on-surface">{title}</h2>
        {subtitle && <p className="text-sm text-on-surface-variant mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>;
}

function PlanCard({ item, suffix, badge, highlights = [], actionLabel = "Contratar", onBuy, disabledReason, featured = false }) {
  return <Card className={cn("flex flex-col", featured && "border-primary ring-1 ring-primary/30")}>
      <CardContent className="p-5 flex flex-col gap-4 h-full">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-base font-bold text-on-surface">{item.name}</h3>
          {badge && <Badge>{badge}</Badge>}
        </div>
        <Price usd={Number(item.priceUsd)} suffix={suffix} size="lg" />
        <p className="text-sm text-on-surface-variant">{item.description}</p>
        {highlights.length > 0 && <ul className="space-y-1.5 text-sm text-on-surface">
            {highlights.map(text => <li key={text} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-good-value shrink-0 mt-0.5" />
                <span>{text}</span>
              </li>)}
          </ul>}
        <div className="mt-auto pt-2">
          <Button type="button" className="w-full" disabled={Boolean(disabledReason)} onClick={() => onBuy(item)} title={disabledReason ?? undefined}>
            {actionLabel}
          </Button>
          {disabledReason && <p className="text-xs text-on-surface-variant mt-2">{disabledReason}</p>}
        </div>
      </CardContent>
    </Card>;
}

function PlanTabs({ active, onChange }) {
  const refs = useRef({});

  function handleKeyDown(event, index) {
    let next = null;
    if (event.key === "ArrowRight") next = (index + 1) % PLAN_TABS.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + PLAN_TABS.length) % PLAN_TABS.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = PLAN_TABS.length - 1;
    if (next === null) return;
    event.preventDefault();
    const tab = PLAN_TABS[next];
    onChange(tab.id);
    refs.current[tab.id]?.focus();
  }

  return <div role="tablist" aria-label="Planes según quién sos" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
      {PLAN_TABS.map((tab, index) => {
        const Icon = TAB_ICONS[tab.id];
        const selected = tab.id === active;
        return <button
          key={tab.id}
          ref={node => { refs.current[tab.id] = node; }}
          type="button"
          role="tab"
          id={`planes-tab-${tab.id}`}
          aria-selected={selected}
          aria-controls={`planes-panel-${tab.id}`}
          tabIndex={selected ? 0 : -1}
          onClick={() => onChange(tab.id)}
          onKeyDown={event => handleKeyDown(event, index)}
          className={cn(
            "flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
            selected ? "border-primary bg-primary/10 ring-1 ring-primary/30" : "border-outline-variant bg-surface hover:bg-surface-container-low"
          )}>
          <Icon className={cn("w-5 h-5 shrink-0", selected ? "text-primary" : "text-on-surface-variant")} />
          <span className="min-w-0">
            <span className={cn("block text-sm font-bold", selected ? "text-primary" : "text-on-surface")}>{tab.label}</span>
            <span className="block text-xs text-on-surface-variant">{tab.hint}</span>
          </span>
        </button>;
      })}
    </div>;
}

function FeaturedSection({ get, professional, handleBuy, reasonFor }) {
  const single = get("FEATURED_SINGLE");
  return <Section id="destacados" title="Destacados" subtitle="Tu publicación en las primeras posiciones, rotulada “Destacada”, durante 7 días.">
      <div className={cn("grid grid-cols-1 gap-4", professional ? "md:grid-cols-3" : "md:grid-cols-2")}>
        <Card>
          <CardContent className="p-5 flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-base font-bold text-on-surface">{single.name}</h3>
              <Star className="w-5 h-5 text-primary" />
            </div>
            <Price usd={Number(single.priceUsd)} suffix="/ 7 días" size="lg" />
            <p className="text-sm text-on-surface-variant">Se compra desde “Mis publicaciones”, eligiendo la propiedad a destacar.</p>
            <Link to="/mis-publicaciones" className="mt-auto inline-flex items-center justify-center h-10 rounded-md border border-outline bg-surface text-sm font-bold text-on-surface hover:bg-surface-container-low">
              Ir a mis publicaciones
            </Link>
          </CardContent>
        </Card>
        {professional && <PlanCard
          item={get("FEATURED_PACK_5")}
          highlights={["USD 6,40 por destacado (20 % menos)", "Se usan en 60 días desde la compra"]}
          onBuy={handleBuy}
          disabledReason={reasonFor(get("FEATURED_PACK_5"))}
        />}
        <Card>
          <CardContent className="p-5 space-y-3 text-sm text-on-surface-variant">
            <h3 className="text-base font-bold text-on-surface">Cómo funcionan</h3>
            <ul className="space-y-2 list-disc pl-4">
              <li>Hay <strong className="text-on-surface">15 lugares</strong> de destacados a la vez en toda la plataforma. Si están ocupados, te avisamos cuándo se libera el próximo y podés <strong className="text-on-surface">reservar tu destacado para esa fecha</strong> (o cancelar y probar más adelante).</li>
              {professional
                ? <li>Máximo simultáneo por cuenta: Inmobiliaria 4, Plus 5. Los destacados incluidos en el plan no se acumulan de un período al otro.</li>
                : <li>Podés tener hasta <strong className="text-on-surface">2 destacados</strong> a la vez.</li>}
              {!professional && <li>Cada dueño recibe <strong className="text-on-surface">un destacado gratis de bienvenida</strong>, una sola vez.</li>}
              <li>Destacar compra visibilidad: <strong className="text-on-surface">no cambia la valuación ni el análisis</strong> de la propiedad.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </Section>;
}

export default function Planes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { byCode, error } = useCatalog();
  const { cardRate } = useCardRate();
  const [checkoutItem, setCheckoutItem] = useState(null);

  const isProfessional = user?.accountType === "PROFESSIONAL";
  const isAdmin = user?.role === "ADMIN";

  // La pestaña activa sale del hash de la URL; sin hash, la que corresponde al tipo de cuenta.
  const hashTab = tabFromHash(location.hash);
  const activeTab = hashTab ?? defaultTabFor(user);
  const catalogReady = Boolean(byCode.ANALYSIS_PASS);

  function selectTab(id) {
    navigate({ hash: `#${id}` }, { replace: true });
  }

  // Si el hash apunta a una sección interna (#packs, #destacados), llevarla a la vista una vez que la pestaña se dibujó.
  useEffect(() => {
    const anchor = location.hash.replace(/^#/, "");
    if (!anchor || !catalogReady || PLAN_TABS.some(tab => tab.id === anchor)) return;
    document.getElementById(anchor)?.scrollIntoView?.({ behavior: "smooth", block: "start" });
  }, [location.hash, catalogReady]);

  function handleBuy(item) {
    if (!user) {
      toast.info("Iniciá sesión para contratar.");
      navigate("/auth/login");
      return;
    }
    setCheckoutItem(item);
  }

  // Motivo por el que un ítem no se puede contratar con esta cuenta (si no, null).
  function reasonFor(item) {
    if (isAdmin) return "Las cuentas de administración no necesitan planes.";
    if (!user) return null;
    if (item.audience === "PROFESSIONAL" && !isProfessional) return "Solo para cuentas profesionales.";
    if (item.audience === "PERSONAL" && isProfessional) return "Solo para cuentas particulares.";
    return null;
  }

  if (error) {
    return <div className="p-8 max-w-3xl mx-auto text-sm text-on-surface-variant">No pudimos cargar los planes. Probá de nuevo en un momento.</div>;
  }
  if (!byCode.ANALYSIS_PASS) {
    return <div className="p-8 max-w-3xl mx-auto text-sm text-on-surface-variant" role="status">Cargando planes…</div>;
  }

  const get = code => byCode[code];

  return <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6 space-y-3">
        <h1 className="text-3xl font-bold text-on-surface flex items-center gap-2">
          <Sparkles className="w-7 h-7 text-primary" /> Planes y precios
        </h1>
        <p className="text-sm text-on-surface-variant max-w-3xl">
          Explorar propiedades, buscar y ver los mapas es gratis para todos. Se paga por más análisis, por publicar más propiedades o por destacarlas.
        </p>
        <p className="text-xs font-mono text-on-surface-variant flex items-start gap-2 max-w-3xl">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <span>
            Los precios son en dólares.
            {cardRate ? ` En pesos es una referencia al dólar tarjeta de hoy (${formatArs(cardRate)}); el cobro es en dólares.` : ""}
            {" "}La pasarela de pagos es simulada: no se pide ningún dato de tarjeta y los planes no se renuevan solos.
          </span>
        </p>
      </div>

      <PlanTabs active={activeTab} onChange={selectTab} />

      {activeTab === "busco" && <div role="tabpanel" id="planes-panel-busco" aria-labelledby="planes-tab-busco" className="space-y-10 animate-in fade-in duration-300">
        <Section id="busco" title="Si estás buscando una propiedad" subtitle="Las herramientas de análisis tienen un cupo gratis por mes. El pase te da más.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <h3 className="text-base font-bold text-on-surface">Gratis</h3>
                <p className="text-3xl font-bold text-on-surface">USD 0</p>
                <ul className="space-y-1.5 text-sm text-on-surface">
                  {["Explorar, buscar y ver mapas sin límite", "Cada mes: 3 tasaciones, 3 recomendaciones y 3 cálculos de Life Score", "Cuentas profesionales: 6 tasaciones y 6 Life Score"].map(text =>
                    <li key={text} className="flex items-start gap-2"><Check className="w-4 h-4 text-good-value shrink-0 mt-0.5" /><span>{text}</span></li>)}
                </ul>
                <p className="text-xs text-on-surface-variant mt-auto">Se renueva el día 1 de cada mes (hora de Argentina).</p>
              </CardContent>
            </Card>
            <PlanCard
              item={get("ANALYSIS_PASS")}
              suffix="/ 30 días"
              badge="Pase de análisis"
              featured
              highlights={["30 tasaciones", "30 recomendaciones, y ver más resultados si los hay", "30 cálculos de Life Score", "Reemplaza el cupo gratis del mes (no se suma)"]}
              onBuy={handleBuy}
              disabledReason={reasonFor(get("ANALYSIS_PASS"))}
            />
            <Card id="packs" className="scroll-mt-6">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <h3 className="text-base font-bold text-on-surface">¿Te quedaste corto? Sumá usos</h3>
                <p className="text-sm text-on-surface-variant">Para quienes ya tienen pase o plan y gastaron los 30. Los usos extra vencen junto con el pase.</p>
                <div className="space-y-3">
                  {["USES_VALUATION_10", "USES_RECOMMENDATION_10", "USES_LIFE_SCORE_10"].map(code => {
                    const item = get(code);
                    const reason = reasonFor(item);
                    return <div key={code} className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-on-surface">{item.name}</p>
                          <Price usd={Number(item.priceUsd)} />
                        </div>
                        <Button type="button" size="sm" variant="outline" disabled={Boolean(reason)} title={reason ?? undefined} onClick={() => handleBuy(item)}>Comprar</Button>
                      </div>;
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </Section>
      </div>}

      {activeTab === "duenos" && <div role="tabpanel" id="planes-panel-duenos" aria-labelledby="planes-tab-duenos" className="space-y-10 animate-in fade-in duration-300">
        <Section id="duenos" title="Si sos dueño y publicás" subtitle="Tus primeras 3 publicaciones activas son gratis, con tasación automática y ficha con el entorno. Para tener más:">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-5 flex flex-col gap-3 h-full">
                <h3 className="text-base font-bold text-on-surface">Gratis</h3>
                <p className="text-3xl font-bold text-on-surface">USD 0</p>
                <p className="text-sm text-on-surface-variant">Hasta 3 publicaciones activas.</p>
                <p className="text-xs text-on-surface-variant mt-auto">Publicar y editar no gasta tus usos de análisis.</p>
              </CardContent>
            </Card>
            {["OWNER_4", "OWNER_5", "OWNER_6"].map(code => <PlanCard key={code} item={get(code)} suffix="/ 30 días" onBuy={handleBuy} disabledReason={reasonFor(get(code))} />)}
          </div>
          <p className="text-xs text-on-surface-variant">
            Más de 6 publicaciones activas requiere una cuenta profesional. Una cuenta profesional se crea con CUIT desde el registro.
          </p>
        </Section>
        <FeaturedSection get={get} professional={false} handleBuy={handleBuy} reasonFor={reasonFor} />
      </div>}

      {activeTab === "profesionales" && <div role="tabpanel" id="planes-panel-profesionales" aria-labelledby="planes-tab-profesionales" className="space-y-10 animate-in fade-in duration-300">
        <Section id="profesionales" title="Inmobiliarias, corredores y desarrolladores" subtitle="Cuenta profesional con CUIT. Los 30 usos de tasación y Life Score reemplazan el cupo gratis mensual.">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <PlanCard
              item={get("PRO_INMOBILIARIA")}
              suffix="/ 30 días"
              highlights={["Hasta 30 publicaciones activas", "1 destacado incluido por período", "30 tasaciones y 30 Life Score", "Hasta 4 destacados a la vez"]}
              onBuy={handleBuy}
              disabledReason={reasonFor(get("PRO_INMOBILIARIA"))}
            />
            <PlanCard
              item={get("PRO_PLUS")}
              suffix="/ 30 días"
              badge="Más publicaciones"
              featured
              highlights={["Hasta 150 publicaciones activas", "3 destacados incluidos por período", "30 tasaciones y 30 Life Score", "Hasta 5 destacados a la vez"]}
              onBuy={handleBuy}
              disabledReason={reasonFor(get("PRO_PLUS"))}
            />
            <PlanCard
              item={get("PUBLICATIONS_50")}
              highlights={["Para quien supera las 150 del plan Plus", "Vale mientras dure tu plan Plus vigente"]}
              onBuy={handleBuy}
              disabledReason={reasonFor(get("PUBLICATIONS_50"))}
            />
          </div>
        </Section>
        <FeaturedSection get={get} professional handleBuy={handleBuy} reasonFor={reasonFor} />
      </div>}

      {user && <p className="text-sm text-on-surface-variant">
          Podés ver tu plan, tus usos del mes y tus pagos en <Link to="/perfil#suscripcion" className="text-primary font-semibold hover:underline">Mi perfil → Suscripción y pagos</Link>.
        </p>}

      {checkoutItem && <CheckoutDialog
        item={checkoutItem}
        onClose={() => setCheckoutItem(null)}
        onApproved={() => toast.success("¡Listo! Tu compra está activa.")}
      />}
    </div>;
}
