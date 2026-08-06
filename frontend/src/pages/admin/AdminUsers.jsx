import { useEffect, useState } from "react";
import { Search, MailCheck, MailWarning, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { api, apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { toast } from "react-toastify";

const PAGE_SIZE = 10;

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deactivateTarget, setDeactivateTarget] = useState(null);

  function loadUsers(targetPage = page, search = query) {
    setLoading(true);
    api.get("/api/admin/users", { params: { query: search || undefined, page: targetPage, size: PAGE_SIZE } })
      .then(res => {
        setUsers(res.data.content);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      })
      .catch(err => toast.error(apiErrorMessage(err, "No se pudieron cargar los usuarios")))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadUsers(0, query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSearch(e) {
    e.preventDefault();
    loadUsers(0, query);
  }

  async function handleActivate(targetUser) {
    try {
      await api.patch(`/api/admin/users/${targetUser.id}/active`, { active: true });
      toast.success(`${targetUser.name} fue reactivado`);
      loadUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo reactivar el usuario"));
    }
  }

  async function handleConfirmDeactivate() {
    const target = deactivateTarget;
    setDeactivateTarget(null);
    try {
      await api.patch(`/api/admin/users/${target.id}/active`, { active: false });
      toast.success(`${target.name} fue desactivado`);
      loadUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo desactivar el usuario"));
    }
  }

  async function handleRoleChange(targetUser, role) {
    try {
      await api.patch(`/api/admin/users/${targetUser.id}/role`, { role });
      toast.success(`${targetUser.name} ahora es ${role === "ADMIN" ? "administrador" : "usuario"}`);
      loadUsers();
    } catch (err) {
      toast.error(apiErrorMessage(err, "No se pudo cambiar el rol"));
    }
  }

  return <div className="space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Usuarios</h1>
        <p className="text-sm font-mono text-on-surface-variant">Gestioná cuentas, verificación y roles.</p>
      </div>

      <form onSubmit={handleSearch} className="max-w-sm">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-outline" />
          <Input type="text" placeholder="Buscar por nombre o email" className="pl-10" value={query} onChange={e => setQuery(e.target.value)} />
        </div>
      </form>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-outline-variant text-left text-xs uppercase tracking-widest text-outline">
                <th className="p-4 font-semibold">Usuario</th>
                <th className="p-4 font-semibold">Verificado</th>
                <th className="p-4 font-semibold">Rol</th>
                <th className="p-4 font-semibold">Alta</th>
                <th className="p-4 font-semibold">Estado</th>
                <th className="p-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-mono text-sm">Cargando…</td></tr>}
              {!loading && users.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-on-surface-variant font-mono text-sm">No se encontraron usuarios.</td></tr>}
              {!loading && users.map(u => <tr key={u.id} className="border-b border-outline-variant last:border-0">
                  <td className="p-4">
                    <div className="font-semibold text-on-surface">{u.name}</div>
                    <div className="text-xs text-on-surface-variant">{u.email}</div>
                  </td>
                  <td className="p-4">
                    {u.emailVerified ? <span className="flex items-center gap-1.5 text-good-value text-xs font-semibold"><MailCheck className="w-4 h-4" /> Verificado</span>
                      : <span className="flex items-center gap-1.5 text-alert-price text-xs font-semibold"><MailWarning className="w-4 h-4" /> Pendiente</span>}
                  </td>
                  <td className="p-4">
                    <select
                      value={u.role}
                      disabled={u.email === currentUser?.email}
                      onChange={e => handleRoleChange(u, e.target.value)}
                      className="text-xs font-semibold border border-outline-variant rounded-md px-2 py-1 bg-surface-container-lowest disabled:opacity-50"
                    >
                      <option value="USER">Usuario</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </td>
                  <td className="p-4 text-xs font-mono text-on-surface-variant">{formatDate(u.createdAt)}</td>
                  <td className="p-4">
                    <Badge variant={u.active ? "good" : "alert"}>{u.active ? "Activo" : "Desactivado"}</Badge>
                  </td>
                  <td className="p-4 text-right">
                    {u.active
                      ? <Button variant="outline" size="sm" disabled={u.email === currentUser?.email} onClick={() => setDeactivateTarget(u)}>Desactivar</Button>
                      : <Button variant="outline" size="sm" onClick={() => handleActivate(u)}>Reactivar</Button>}
                  </td>
                </tr>)}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {totalPages > 1 && <div className="flex items-center justify-center gap-4">
          <Button variant="ghost" size="sm" disabled={page === 0} onClick={() => loadUsers(page - 1)}>
            <ChevronLeft className="w-4 h-4" /> Anterior
          </Button>
          <span className="text-xs font-mono text-on-surface-variant">Página {page + 1} de {totalPages}</span>
          <Button variant="ghost" size="sm" disabled={page >= totalPages - 1} onClick={() => loadUsers(page + 1)}>
            Siguiente <ChevronRight className="w-4 h-4" />
          </Button>
        </div>}

      <ConfirmDialog
        open={!!deactivateTarget}
        title="¿Desactivar cuenta?"
        description={deactivateTarget ? `${deactivateTarget.name} no va a poder iniciar sesión hasta que la reactives.` : ""}
        confirmLabel="Desactivar"
        variant="danger"
        onConfirm={handleConfirmDeactivate}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>;
}
