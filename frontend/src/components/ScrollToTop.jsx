import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// React Router no hace esto solo: al navegar entre páginas mantiene el
// scroll donde estaba (por ej. si abrís una propiedad desde el final de un
// listado largo, el detalle arranca scrolleado). El contenido de la app
// scrollea adentro del <main> de cada layout (overflow-auto), no en window
// (excepto AuthLayout, que sí es a nivel de documento) — por eso se resetean
// los dos.
export function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    document.querySelector("main")?.scrollTo(0, 0);
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}
