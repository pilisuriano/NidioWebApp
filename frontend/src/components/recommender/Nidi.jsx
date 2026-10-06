import "./nidi.css";

const BASE_W = 313;
const BASE_H = 368;

/**
 * Nidi, el hornero del recomendador. `mode`: "idle" (reposo), "searching" (buscando) o "happy"
 * (resultados). `width` es el ancho en px; el alto se calcula con la proporción de la ilustración.
 * Las imágenes (cuerpo y ala por separado) están en /public/nidi.
 */
export function Nidi({ mode = "idle", width = 120, className = "" }) {
  const scale = width / BASE_W;
  return <div className={`nidi-box nidi-${mode} ${className}`} style={{ width, height: BASE_H * scale }} aria-hidden="true">
      <div className="nidi-scale" style={{ transform: `scale(${scale})` }}>
        <div className="nidi-fig">
          <img src="/nidi/body.png" alt="" draggable="false" />
          <img className="nidi-wing" src="/nidi/wing.png" alt="" draggable="false" />
        </div>
      </div>
    </div>;
}
