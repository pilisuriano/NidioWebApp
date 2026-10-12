import { Card, CardContent } from "@/components/ui/Card";

const SECTIONS = [{
  title: "1. Aceptación de los términos",
  body: "Al registrarte o utilizar Nidio aceptás estos Términos y Condiciones. Si no estás de acuerdo, te pedimos que no uses la plataforma."
}, {
  title: "2. Qué es Nidio",
  body: "Nidio es una plataforma de análisis del mercado inmobiliario de la Ciudad Autónoma de Buenos Aires (CABA), pensada para compradores e inquilinos. A diferencia de un portal de avisos clasificados, Nidio no publica ni intermedia operaciones inmobiliarias reales: ofrece herramientas de análisis (estimación de rango de valor, mapas de calor de precios y un indicador de entorno urbano o \"Life Score\") para ayudarte a tomar decisiones informadas."
}, {
  title: "3. Catálogo de propiedades",
  body: "El catálogo de propiedades que se muestra en Nidio se construyó a partir de una muestra del conjunto de datos con el que se entrenó el modelo de valuación. Las direcciones fueron anonimizadas, los publicadores son cuentas ficticias, las imágenes son ilustrativas (bancos de imágenes de uso libre) y los precios son valores de referencia cargados manualmente a partir de propiedades comparables. Por eso no representa avisos reales ni ofertas vigentes de venta o alquiler, y no debe usarse para contactar a ningún tercero ni para tomar decisiones de compra o alquiler sobre una propiedad puntual."
}, {
  title: "4. Estimaciones de valor y Life Score",
  body: "Los rangos de valor generados por el modelo de valuación y los puntajes de Life Score son estimaciones orientativas basadas en datos públicos y modelos estadísticos. No constituyen una tasación profesional, no reemplazan el asesoramiento de un martillero o corredor matriculado, y Nidio no garantiza que el precio final de una operación real coincida con el rango estimado."
}, {
  title: "5. Cuenta de usuario",
  body: "Para acceder a algunas funciones (tasación, Life Score, guardar búsquedas) necesitás crear una cuenta con un email válido y confirmarlo mediante el link de verificación que te enviamos. Sos responsable de mantener la confidencialidad de tu contraseña y de toda actividad realizada desde tu cuenta."
}, {
  title: "6. Uso permitido",
  body: "Te comprometés a usar Nidio de forma lícita, sin intentar acceder a datos de otros usuarios, vulnerar la seguridad de la plataforma, ni utilizar los datos o estimaciones con fines comerciales sin autorización."
}, {
  title: "7. Propiedad intelectual",
  body: "El software, el diseño, los modelos de valuación y el contenido de Nidio son propiedad de sus desarrolladores. No está permitida su reproducción o distribución sin autorización previa."
}, {
  title: "8. Cambios en estos términos",
  body: "Podemos actualizar estos Términos y Condiciones para reflejar cambios en la plataforma. Te recomendamos revisarlos periódicamente; el uso continuado de Nidio implica la aceptación de la versión vigente."
}, {
  title: "9. Contacto",
  body: "Ante cualquier consulta sobre estos términos, podés escribirnos a nidio.propiedades@gmail.com."
}];

export default function Terminos() {
  return <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Términos y condiciones</h1>
        <p className="text-sm font-mono text-on-surface-variant">Última actualización: octubre de 2026.</p>
      </div>

      <Card>
        <CardContent className="p-5 sm:p-8 space-y-8">
          {SECTIONS.map(section => <div key={section.title} className="space-y-2">
              <h2 className="text-lg font-bold text-primary">{section.title}</h2>
              <p className="text-sm text-on-surface-variant leading-relaxed">{section.body}</p>
            </div>)}
        </CardContent>
      </Card>
    </div>;
}
