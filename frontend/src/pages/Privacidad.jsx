import { Card, CardContent } from "@/components/ui/Card";

const SECTIONS = [{
  title: "1. Marco legal",
  body: "Nidio trata tus datos personales conforme a la Ley 25.326 de Protección de Datos Personales de la República Argentina. No utilizamos técnicas de scraping ni recolectamos datos personales de terceros desde otros portales o sitios web."
}, {
  title: "2. Qué datos recopilamos",
  body: "Al crear una cuenta guardamos tu nombre, email y contraseña (encriptada con BCrypt, nunca en texto plano). De forma opcional podés completar tu DNI y teléfono en tu perfil. También registramos las valuaciones y consultas de Life Score que realizás para poder mostrarte tu actividad."
}, {
  title: "3. Para qué usamos tus datos",
  body: "Usamos tu email para verificar tu cuenta, permitirte iniciar sesión y enviarte links de recuperación de contraseña cuando los solicitás. No usamos tus datos con fines publicitarios ni los vendemos ni compartimos con terceros."
}, {
  title: "4. Catálogo de propiedades",
  body: "El catálogo de propiedades que se muestra en Nidio se construyó a partir de una muestra de datos del mercado inmobiliario de CABA, a la que se le anonimizaron las direcciones, se le asignaron publicadores ficticios y se le agregaron fotografías ilustrativas, para validar la plataforma sin exponer datos de personas ni de inmuebles reales. No contiene datos personales de propietarios, inquilinos ni inmobiliarias reales."
}, {
  title: "5. Seguridad",
  body: "El acceso a la plataforma está protegido con autenticación basada en JWT y contraseñas encriptadas con BCrypt, y todas las comunicaciones se realizan mediante HTTPS. Las sesiones expiran a las 24 horas de actividad o a los 30 minutos de inactividad."
}, {
  title: "6. Tus derechos (ARCO)",
  body: "Como titular de tus datos, tenés derecho a acceder, rectificar, actualizar y suprimir la información que tenemos sobre vos. Podés actualizar tus datos personales desde tu perfil en cualquier momento, o escribirnos a nidio.propiedades@gmail.com para ejercer estos derechos, incluyendo la baja de tu cuenta."
}, {
  title: "7. Conservación de datos",
  body: "Conservamos tus datos mientras tu cuenta esté activa. Si solicitás la eliminación de tu cuenta, eliminamos o anonimizamos tus datos personales, salvo que la ley exija conservar cierta información."
}, {
  title: "8. Terceros",
  body: "Para el envío de emails (verificación de cuenta y recuperación de contraseña) usamos un servicio de correo (Gmail SMTP) exclusivamente como canal de envío; no compartimos tu información con fines distintos a ese envío."
}, {
  title: "9. Contacto y reclamos",
  body: "Ante cualquier consulta sobre el tratamiento de tus datos personales podés escribirnos a nidio.propiedades@gmail.com. También podés dirigir reclamos ante la Agencia de Acceso a la Información Pública, órgano de control de la Ley 25.326."
}];

export default function Privacidad() {
  return <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="border-b border-outline-variant pb-6">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Privacidad y protección de datos</h1>
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
