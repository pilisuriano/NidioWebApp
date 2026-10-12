import { useRef, useState } from "react";
import { optimizedImage, IMG_THUMB } from "@/lib/images";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { api, apiErrorMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 8;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Selector de fotos usado en "Publicar" y en la edición de propiedades del
// panel admin: grilla de miniaturas cuadradas (evita la caja ancha que
// recortaba mal fotos verticales/4:3) + botón para agregar más, hasta
// MAX_IMAGES. La primera foto es la portada (se usa en tarjetas/mapa).
export function ImageUploader({ images, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  async function uploadFiles(fileList) {
    const files = Array.from(fileList ?? []);
    if (files.length === 0) return;
    const room = MAX_IMAGES - images.length;
    if (room <= 0) {
      setError(`Máximo ${MAX_IMAGES} fotos por propiedad`);
      return;
    }
    setError(null);
    setUploading(true);
    let next = images;
    for (const file of files.slice(0, room)) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setError("Solo se permiten imágenes JPG, PNG o WEBP");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("Cada imagen no puede pesar más de 5MB");
        continue;
      }
      try {
        const body = new FormData();
        body.append("file", file);
        const res = await api.post("/api/uploads/image", body);
        next = [...next, res.data.url];
        onChange(next);
      } catch (err) {
        setError(apiErrorMessage(err, "No se pudo subir la foto"));
      }
    }
    setUploading(false);
  }

  function handleInputChange(e) {
    uploadFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragOver(false);
    uploadFiles(e.dataTransfer.files);
  }

  function removeAt(i) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  return <div className="space-y-3">
      <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleInputChange} className="hidden" />
      {error && <p className="text-xs font-semibold text-error">{error}</p>}
      <div
        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "grid grid-cols-3 sm:grid-cols-4 gap-3 rounded-lg border-2 border-dashed p-3 transition-colors",
          dragOver ? "border-primary bg-primary/5" : "border-outline-variant"
        )}
      >
        {images.map((url, i) => <div key={url + i} className="group relative aspect-square overflow-hidden rounded-lg bg-surface-dim">
            <img src={optimizedImage(url, IMG_THUMB)} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute bottom-1 left-1 rounded bg-inverse-surface/80 px-1.5 py-0.5 text-[10px] font-bold text-white">Portada</span>}
            <button type="button" onClick={() => removeAt(i)} aria-label="Quitar foto" className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-inverse-surface/80 text-white opacity-0 transition-opacity group-hover:opacity-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>)}

        {images.length < MAX_IMAGES && <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-outline-variant text-xs text-on-surface-variant transition-colors hover:border-primary hover:bg-primary/5"
          >
            {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <UploadCloud className="h-5 w-5" />}
            {uploading ? "Subiendo…" : "Agregar foto"}
          </button>}
      </div>
      <p className="text-xs text-on-surface-variant">
        {images.length}/{MAX_IMAGES} fotos · JPG, PNG o WEBP, hasta 5MB c/u. Podés arrastrar varias juntas.
      </p>
    </div>;
}
