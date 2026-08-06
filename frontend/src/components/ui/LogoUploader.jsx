import { useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Selector de una sola imagen (el logo de la cuenta profesional), en vez de
// reusar ImageUploader (pensado para la grilla de varias fotos de una
// propiedad) — acá alcanza con un círculo de preview + botón, sin "Portada"
// ni límite de 8.
export function LogoUploader({ logoUrl, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  async function handleInputChange(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Solo se permiten imágenes JPG, PNG o WEBP");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no puede pesar más de 5MB");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await api.post("/api/uploads/image", body);
      onChange(res.data.url);
    } catch (err) {
      setError(apiErrorMessage(err, "No se pudo subir el logo"));
    } finally {
      setUploading(false);
    }
  }

  return <div className="space-y-2">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleInputChange} className="hidden" />
      {error && <p className="text-xs font-semibold text-error">{error}</p>}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 shrink-0">
          {logoUrl
            ? <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-full object-cover border border-outline-variant" />
            : <div className="w-16 h-16 rounded-full bg-surface-dim border border-dashed border-outline-variant" />}
          {logoUrl && <button type="button" onClick={() => onChange("")} aria-label="Quitar logo" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-inverse-surface text-white flex items-center justify-center">
              <X className="w-3 h-3" />
            </button>}
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} disabled={uploading} className="flex items-center gap-2 text-sm font-semibold px-3 py-2 rounded-md border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary transition-colors">
          {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
          {uploading ? "Subiendo…" : logoUrl ? "Cambiar logo" : "Subir logo"}
        </button>
      </div>
      <p className="text-xs text-on-surface-variant">JPG, PNG o WEBP, hasta 5MB. Se muestra junto al check de verificado en tus avisos.</p>
    </div>;
}
