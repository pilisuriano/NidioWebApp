import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Users, ShieldCheck, MailCheck, Building2, Calculator, HeartPulse } from "lucide-react";
import { api } from "@/lib/api";

const METRIC_CARDS = [{ key: "totalUsers", label: "Usuarios totales", icon: Users, color: "text-primary bg-primary/10" }, { key: "verifiedUsers", label: "Emails verificados", icon: MailCheck, color: "text-good-value bg-good-value/10" }, { key: "activeUsers", label: "Cuentas activas", icon: ShieldCheck, color: "text-secondary bg-secondary/10" }, { key: "adminUsers", label: "Administradores", icon: ShieldCheck, color: "text-alert-price bg-alert-price/10" }, { key: "totalProperties", label: "Propiedades en catálogo", icon: Building2, color: "text-primary bg-primary/10" }, { key: "totalValuations", label: "Tasaciones realizadas", icon: Calculator, color: "text-good-value bg-good-value/10" }, { key: "totalLifeScoreQueries", label: "Consultas Life Score", icon: HeartPulse, color: "text-secondary bg-secondary/10" }];

export default function AdminMetrics() {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    api.get("/api/admin/metrics").then(res => setMetrics(res.data)).catch(() => setMetrics(null));
  }, []);

  return <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Métricas</h1>
        <p className="text-sm font-mono text-on-surface-variant">Vista general del uso de la plataforma.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {METRIC_CARDS.map(({ key, label, icon: Icon, color }) => <Card key={key}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-outline uppercase tracking-widest">{label}</CardTitle>
              <span className={`w-9 h-9 rounded-full flex items-center justify-center ${color}`}>
                <Icon className="w-4 h-4" />
              </span>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-on-surface">{metrics ? metrics[key] : "—"}</span>
            </CardContent>
          </Card>)}
      </div>
    </div>;
}
