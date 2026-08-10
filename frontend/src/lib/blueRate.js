import { useEffect, useState } from "react";

// Cotización del dólar blue (dolarapi.com, API pública sin key) -- se usa
// para convertir montos ARS<->USD del lado del cliente cuando hace falta
// compararlos contra el modelo, que siempre trabaja en USD, venta y
// alquiler por igual (ver bitácora del modelo 6.41 adendum). Un solo lugar
// para esta lógica: la usan tanto Valuacion.jsx (tasación en vivo) como
// PropertyDetail.jsx (ficha de una propiedad ya publicada, para comparar
// el precio en ARS de un alquiler contra el rango estimado en USD).
export const BLUE_RATE_URL = "https://dolarapi.com/v1/dolares/blue";

export function useBlueRate() {
  // null mientras carga o si falló -- ver BLUE_RATE_URL arriba.
  const [blueRate, setBlueRate] = useState(null);
  const [blueRateError, setBlueRateError] = useState(false);

  useEffect(() => {
    fetch(BLUE_RATE_URL)
      .then(res => {
        if (!res.ok) throw new Error(`dolarapi respondió ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (typeof data.venta === "number") setBlueRate(data.venta);
        else throw new Error("respuesta sin campo 'venta'");
      })
      .catch(() => setBlueRateError(true));
  }, []);

  return { blueRate, blueRateError };
}
