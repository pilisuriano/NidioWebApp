// Prueba de carga de Nidio: 50 usuarios virtuales concurrentes (k6).
//
// Qué mide: tiempos de respuesta y tasa de errores de la API (backend Java, que a su vez llama
// al ml-service para valuación y Life Score) mientras 50 usuarios hacen un recorrido realista.
// Requerimiento que verifica (informe 3.3.2): "la plataforma debe soportar al menos 50 usuarios
// concurrentes sin degradación del servicio" y "el cálculo del Life Score debe completarse en
// menos de 5 segundos".
//
// Uso (PowerShell):
//   $env:BASE_URL="https://TU-BACKEND.onrender.com"; $env:EMAIL="..."; $env:PASSWORD="..."
//   k6 run nidio-carga.js
// Prueba corta para verificar que todo funciona antes de la real:
//   k6 run --env SMOKE=1 nidio-carga.js
import http from "k6/http";
import { check, sleep, group } from "k6";

const BASE = (__ENV.BASE_URL || "http://localhost:8080").replace(/\/$/, "");
const EMAIL = __ENV.EMAIL;
const PASSWORD = __ENV.PASSWORD;
const SMOKE = !!__ENV.SMOKE;

export const options = {
  scenarios: {
    usuarios: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: SMOKE
        ? [{ duration: "20s", target: 3 }, { duration: "10s", target: 0 }]
        : [
            { duration: "1m", target: 10 },  // calentamiento
            { duration: "1m", target: 50 },  // sube a 50 usuarios
            { duration: "5m", target: 50 },  // sostiene 50 usuarios concurrentes
            { duration: "30s", target: 0 },  // baja
          ],
      gracefulRampDown: "30s",
    },
  },
  // Umbrales: si alguno falla, k6 termina con código distinto de 0 y lo marca en rojo.
  thresholds: {
    http_req_failed: ["rate<0.01"],                          // menos de 1% de errores
    checks: ["rate>0.99"],
    "http_req_duration{tipo:consulta}": ["p(95)<2000"],      // catálogo, detalle, mapas
    "http_req_duration{tipo:calculo}": ["p(95)<5000"],       // valuación, Life Score, recomendador
    "http_req_duration{endpoint:life_score}": ["p(95)<5000"], // NFR: Life Score < 5 s
  },
};

const JSON_HEADERS = { "Content-Type": "application/json" };
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const think = () => sleep(1 + Math.random() * 3); // 1 a 4 s entre acciones, como una persona

// Se ejecuta una sola vez antes de la carga: inicia sesión con una cuenta de prueba y junta los
// datos que necesitan los pedidos (barrios y propiedades reales del catálogo). Se hace una vez y no
// por usuario a propósito: la prueba mide el uso concurrente de las funciones, no 50 logins a la vez.
export function setup() {
  if (!EMAIL || !PASSWORD) throw new Error("Faltan las variables EMAIL y PASSWORD");
  const login = http.post(`${BASE}/api/auth/login`, JSON.stringify({ email: EMAIL, password: PASSWORD }), { headers: JSON_HEADERS });
  if (login.status !== 200) throw new Error(`Login falló (${login.status}): ${login.body}`);
  const token = login.json("token");
  const auth = { headers: { ...JSON_HEADERS, Authorization: `Bearer ${token}` } };

  const neighborhoods = http.get(`${BASE}/api/neighborhoods`, auth).json().map(n => n.id);
  const page = http.get(`${BASE}/api/properties?size=50`, auth).json("content");
  const ids = page.map(p => p.id);
  const sample = http.get(`${BASE}/api/properties/${ids[0]}`, auth).json();
  if (!neighborhoods.length || !ids.length) throw new Error("El catálogo está vacío: no hay con qué probar");
  return { token, neighborhoods, ids, address: sample.address, lat: sample.location.lat, lon: sample.location.lon };
}

export default function (data) {
  const auth = { headers: { ...JSON_HEADERS, Authorization: `Bearer ${data.token}` } };
  const consulta = name => ({ ...auth, tags: { endpoint: name, tipo: "consulta" } });
  const calculo = name => ({ ...auth, tags: { endpoint: name, tipo: "calculo" } });

  group("explorar", () => {
    let r = http.get(`${BASE}/api/properties?page=0&size=12`, consulta("catalogo"));
    check(r, { "catálogo 200": x => x.status === 200 });
    think();
    r = http.get(`${BASE}/api/properties/${pick(data.ids)}`, consulta("detalle"));
    check(r, { "detalle 200": x => x.status === 200 });
    think();
    if (Math.random() < 0.5) {
      r = http.get(`${BASE}/api/heatmaps/price?operationType=${pick(["SALE", "RENT"])}`, consulta("mapa_precios"));
      check(r, { "mapa de precios 200": x => x.status === 200 });
      think();
    }
  });

  if (Math.random() < 0.3) {
    group("valuacion", () => {
      const body = {
        operationType: pick(["SALE", "RENT"]), propertyType: pick(["APARTMENT", "HOUSE", "PH"]),
        neighborhoodId: pick(data.neighborhoods), surfaceM2: 40 + Math.floor(Math.random() * 80),
        rooms: 1 + Math.floor(Math.random() * 4),
      };
      const r = http.post(`${BASE}/api/valuations`, JSON.stringify(body), calculo("valuacion"));
      check(r, { "valuación 2xx": x => x.status >= 200 && x.status < 300 });
      think();
    });
  }

  if (Math.random() < 0.3) {
    group("life_score", () => {
      const weights = { TRANSPORT: 5, COMMERCE: 3, GREEN_SPACE: 3, HEALTH: 3, GASTRONOMY: 3, NIGHTLIFE: 1, EDUCATION: 3 };
      const body = { address: data.address, lat: data.lat, lon: data.lon, weights };
      const r = http.post(`${BASE}/api/life-score`, JSON.stringify(body), calculo("life_score"));
      check(r, { "life score 2xx": x => x.status >= 200 && x.status < 300 });
      think();
    });
  }

  if (Math.random() < 0.3) {
    group("recomendador", () => {
      const body = {
        operationType: "RENT", household: pick(["SOLO", "COUPLE", "FAMILY"]), dealbreaker: "UNSAFE",
        noisePreference: pick(["QUIET", "TOLERANT"]), overpricedPolicy: "LAST", blueRate: 1400,
        proximity: { TRANSPORT: "KEY", COMMERCE: "IMPORTANT", GREEN_SPACE: "IMPORTANT" },
      };
      const r = http.post(`${BASE}/api/recommendations`, JSON.stringify(body), calculo("recomendador"));
      check(r, { "recomendador 2xx": x => x.status >= 200 && x.status < 300 });
      think();
    });
  }
}
