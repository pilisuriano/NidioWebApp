import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Search, Plus, Calculator, Activity, CheckCircle2, Info, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import { formatDate, formatNumber, OPERATION_TYPE_LABEL, PROPERTY_TYPE_LABEL } from "@/lib/format";
function ResultBadge({
  result
}) {
  if (result === "FAIR") {
    return <Badge variant="good" className="bg-good-value/5 gap-1 border border-good-value/20">
        <CheckCircle2 className="w-3 h-3" /> EN RANGO
      </Badge>;
  }
  if (result === "OVERVALUED") {
    return <Badge variant="alert" className="gap-1">
        <AlertTriangle className="w-3 h-3" /> SOBREVALUADA
      </Badge>;
  }
  if (result === "UNDERVALUED") {
    return <Badge variant="secondary" className="bg-secondary/10 text-secondary gap-1 border border-secondary/20">
        <Info className="w-3 h-3" /> SUBVALUADA
      </Badge>;
  }
  return <span className="text-xs text-on-surface-variant font-mono">—</span>;
}
function scoreColor(score) {
  if (score >= 80) return "text-good-value";
  if (score >= 60) return "text-primary";
  return "text-secondary";
}
function scoreLabel(score) {
  if (score >= 80) return "EXCELENTE";
  if (score >= 60) return "ÓPTIMO";
  if (score >= 40) return "NEUTRAL";
  return "BAJO";
}
export default function Busquedas() {
  const [valuations, setValuations] = useState([]);
  const [lifeScores, setLifeScores] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    Promise.allSettled([api.get("/api/valuations").then(res => setValuations(res.data)), api.get("/api/life-score").then(res => setLifeScores(res.data))]).finally(() => setLoading(false));
  }, []);
  const normalizedFilter = filter.trim().toLowerCase();
  const filteredValuations = valuations.filter(v => !normalizedFilter || v.neighborhoodName.toLowerCase().includes(normalizedFilter));
  const filteredLifeScores = lifeScores.filter(q => !normalizedFilter || q.address.toLowerCase().includes(normalizedFilter));
  return <div className="p-8 max-w-7xl mx-auto space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
        <h1 className="text-2xl font-bold text-primary">Mis búsquedas</h1>
        <div className="flex gap-4">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-outline" />
            <Input placeholder="Filtrar por dirección o barrio..." className="pl-9 h-9" value={filter} onChange={e => setFilter(e.target.value)} />
          </div>
          <Link to="/valuacion">
            <Button className="h-9 gap-2">
              <Plus className="w-4 h-4" /> Nueva Consulta
            </Button>
          </Link>
        </div>
      </div>

      {/* Valuaciones Recientes */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" />
          Valuaciones Recientes
        </h2>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-surface-container-low text-xs uppercase font-bold text-outline-variant border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-4">FECHA</th>
                  <th className="px-6 py-4">BARRIO</th>
                  <th className="px-6 py-4">DETALLE</th>
                  <th className="px-6 py-4">RANGO ESTIMADO</th>
                  <th className="px-6 py-4">RESULTADO</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/50 text-on-surface font-mono">
                {filteredValuations.map(v => <tr key={v.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="px-6 py-4">{formatDate(v.createdAt)}</td>
                    <td className="px-6 py-4 font-bold font-sans">{v.neighborhoodName}</td>
                    <td className="px-6 py-4 text-xs">
                      {PROPERTY_TYPE_LABEL[v.propertyType]} · {v.rooms} amb · {formatNumber(v.surfaceM2)} m² ·{" "}
                      {OPERATION_TYPE_LABEL[v.operationType]}
                    </td>
                    <td className="px-6 py-4 text-primary font-bold">
                      {formatNumber(v.estimatedMin)} - {formatNumber(v.estimatedMax)}{" "}
                      <span className="text-[10px] font-normal">{v.operationType === "SALE" ? "USD" : "ARS/mes"}</span>
                    </td>
                    <td className="px-6 py-4">
                      <ResultBadge result={v.result} />
                    </td>
                  </tr>)}
                {filteredValuations.length === 0 && <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-on-surface-variant font-sans">
                      {loading ? "Cargando…" : <>
                          Todavía no hiciste valuaciones.{" "}
                          <Link to="/valuacion" className="text-primary font-bold hover:underline">Hacer la primera</Link>
                        </>}
                    </td>
                  </tr>}
              </tbody>
            </table>
          </div>
        </Card>
      </section>

      {/* Consultas Life Score */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Consultas Life Score
        </h2>

        {filteredLifeScores.length === 0 ? <Card>
            <CardContent className="p-10 text-center text-on-surface-variant">
              {loading ? "Cargando…" : <>
                  Todavía no calculaste ningún Life Score.{" "}
                  <Link to="/life-score" className="text-primary font-bold hover:underline">Calcular el primero</Link>
                </>}
            </CardContent>
          </Card> : <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {filteredLifeScores.map(q => <Card key={q.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-mono text-outline-variant mb-1">{formatDate(q.createdAt)}</p>
                      <h3 className="font-bold text-on-surface text-base">{q.address}</h3>
                    </div>
                    <div className={`text-right ${scoreColor(q.totalScore)}`}>
                      <span className="text-3xl font-bold tracking-tighter">{Math.round(q.totalScore)}</span>
                      <span className="block text-[10px] uppercase font-bold tracking-widest mt-[-4px]">Score</span>
                    </div>
                  </div>

                  <div>
                    <div className="h-1.5 bg-surface-dim rounded-full mb-2">
                      <div className="h-full bg-primary rounded-full" style={{
                  width: `${Math.min(q.totalScore, 100)}%`
                }}></div>
                    </div>
                    <div className="flex justify-between text-xs font-bold uppercase tracking-wider">
                      <span className="text-on-surface-variant">Entorno urbano</span>
                      <span className={scoreColor(q.totalScore)}>{scoreLabel(q.totalScore)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>)}
          </div>}
      </section>
    </div>;
}
