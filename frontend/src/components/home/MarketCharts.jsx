import { useEffect, useMemo, useState } from "react";
import { Bar, BarChart, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { formatNumber } from "@/lib/format";
import { useBlueRate } from "@/lib/blueRate";
import { cn } from "@/lib/utils";
import { offerByNeighborhood, rankNeighborhoods, roomsBreakdown, valuationBreakdown } from "@/lib/marketStats";

// Gráficos de mercado del inicio. Los datos (mapa de calor y catálogo) son
// públicos, así que se ven también sin iniciar sesión.

const COLORS = { primary: "#00647c", secondary: "#4059aa", good: "#1F4D36", alert: "#7F1D3D", muted: "#6e797e" };
const TOOLTIP_STYLE = { borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" };

function Segmented({ options, value, onChange, label }) {
  return <div role="group" aria-label={label} className="inline-flex rounded-full bg-surface-container p-0.5 text-xs font-bold">
      {options.map(o => <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)} className={cn("rounded-full px-3 py-1 transition-colors", value === o.value ? "bg-primary text-on-primary shadow-sm" : "text-on-surface-variant hover:text-on-surface")}>
          {o.label}
        </button>)}
    </div>;
}

function Empty({ children }) {
  return <div className="h-full flex items-center justify-center text-center text-sm text-on-surface-variant font-mono px-4">{children}</div>;
}

// Barras horizontales: los nombres de barrio se leen enteros, sin rotarlos.
function HorizontalBars({ data, dataKey, color, format, tooltipLabel }) {
  return <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 56, left: 0, bottom: 0 }}>
        <XAxis type="number" hide />
        <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.muted }} interval={0} />
        <Tooltip cursor={{ fill: "#f0f3ff" }} formatter={value => [format(Number(value)), tooltipLabel]} contentStyle={TOOLTIP_STYLE} />
        <Bar dataKey={dataKey} fill={color} radius={[0, 3, 3, 0]} barSize={16} label={{ position: "right", fontSize: 11, fill: COLORS.muted, formatter: v => format(Number(v)) }} />
      </BarChart>
    </ResponsiveContainer>;
}

export function MarketCharts() {
  const { blueRate } = useBlueRate();
  const [sale, setSale] = useState(null);
  const [rent, setRent] = useState(null);
  const [properties, setProperties] = useState(null);
  const [operation, setOperation] = useState("SALE");
  const [order, setOrder] = useState("desc");

  useEffect(() => {
    const features = res => res.data.features;
    api.get("/api/heatmaps/price", { params: { operationType: "SALE" } }).then(res => setSale(features(res))).catch(() => setSale([]));
    api.get("/api/heatmaps/price", { params: { operationType: "RENT" } }).then(res => setRent(features(res))).catch(() => setRent([]));
    api.get("/api/properties", { params: { size: 300 } }).then(res => setProperties(res.data.content)).catch(() => setProperties([]));
  }, []);

  const ranking = useMemo(() => rankNeighborhoods(operation === "SALE" ? sale : rent, order), [sale, rent, operation, order]);
  const offer = useMemo(() => offerByNeighborhood(properties), [properties]);
  const valuation = useMemo(() => valuationBreakdown(properties, blueRate), [properties, blueRate]);
  const rooms = useMemo(() => roomsBreakdown(properties), [properties]);

  const valuationData = [
    { name: "Subvaluadas", value: valuation.UNDERVALUED, color: COLORS.secondary },
    { name: "En rango", value: valuation.FAIR, color: COLORS.good },
    { name: "Sobrevaluadas", value: valuation.OVERVALUED, color: COLORS.alert }
  ].filter(d => d.value > 0);
  const valuationTotal = valuationData.reduce((sum, d) => sum + d.value, 0);
  const unit = operation === "SALE" ? "USD/m²" : "ARS/m²/mes";

  return <section aria-label="Mercado inmobiliario de CABA" className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-on-surface">El mercado en números</h2>
        <p className="text-sm text-on-surface-variant">Datos del catálogo y del mapa de calor de Nidio.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="gap-3 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm text-outline uppercase tracking-widest">Precio promedio por m²</CardTitle>
              <CardDescription>{order === "desc" ? "Barrios más caros" : "Barrios más accesibles"} · {unit} (2 ambientes, usado)</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Segmented label="Operación" value={operation} onChange={setOperation} options={[{ value: "SALE", label: "Venta" }, { value: "RENT", label: "Alquiler" }]} />
              <Segmented label="Orden" value={order} onChange={setOrder} options={[{ value: "desc", label: "Más caros" }, { value: "asc", label: "Más accesibles" }]} />
            </div>
          </CardHeader>
          <CardContent className="h-72 mt-2">
            {ranking.length > 0 ? <HorizontalBars data={ranking} dataKey="precio" color={operation === "SALE" ? COLORS.primary : COLORS.secondary} format={v => formatNumber(v)} tooltipLabel={unit} /> : <Empty>{sale === null || rent === null ? "Cargando…" : "Sin datos de precios"}</Empty>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm text-outline uppercase tracking-widest">Dónde hay más oferta</CardTitle>
              <CardDescription>Barrios con más publicaciones, en venta y en alquiler.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-72 mt-2">
            {offer.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={offer} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="name" width={110} axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.muted }} interval={0} />
                  <Tooltip cursor={{ fill: "#f0f3ff" }} contentStyle={TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="venta" name="Venta" stackId="a" fill={COLORS.primary} barSize={16} />
                  <Bar dataKey="alquiler" name="Alquiler" stackId="a" fill={COLORS.secondary} radius={[0, 3, 3, 0]} barSize={16} />
                </BarChart>
              </ResponsiveContainer> : <Empty>{properties === null ? "Cargando…" : "Sin publicaciones"}</Empty>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm text-outline uppercase tracking-widest">Tasación de Nidio en la oferta</CardTitle>
              <CardDescription>Cuántas publicaciones están por debajo, dentro o por encima del rango estimado.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-72 mt-2">
            {valuationTotal > 0 ? <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={valuationData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2} label={({ value }) => `${Math.round((value / valuationTotal) * 100)}%`}>
                    {valuationData.map(d => <Cell key={d.name} fill={d.color} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [`${value} publicaciones`, name]} contentStyle={TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer> : <Empty>{properties === null ? "Cargando…" : "Sin tasaciones para mostrar"}</Empty>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <div className="space-y-1">
              <CardTitle className="text-sm text-outline uppercase tracking-widest">Oferta por ambientes</CardTitle>
              <CardDescription>Publicaciones del catálogo, en venta y en alquiler.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="h-72 mt-2">
            {properties && properties.length > 0 ? <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rooms} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: COLORS.muted }} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} width={32} tick={{ fontSize: 11, fill: COLORS.muted }} />
                  <Tooltip cursor={{ fill: "#f0f3ff" }} contentStyle={TOOLTIP_STYLE} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="venta" name="Venta" stackId="a" fill={COLORS.primary} barSize={36} />
                  <Bar dataKey="alquiler" name="Alquiler" stackId="a" fill={COLORS.secondary} radius={[3, 3, 0, 0]} barSize={36} />
                </BarChart>
              </ResponsiveContainer> : <Empty>{properties === null ? "Cargando…" : "Sin publicaciones"}</Empty>}
          </CardContent>
        </Card>
      </div>
    </section>;
}
