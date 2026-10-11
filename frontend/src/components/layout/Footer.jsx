import { Link } from "react-router-dom";
import { Facebook, Instagram, Youtube, Twitter, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth";

const SITE_LINKS = [{ label: "Inicio", to: "/" }, { label: "Explorar propiedades", to: "/mapa" }, { label: "Tasación", to: "/tasacion" }, { label: "Mis publicaciones", to: "/mis-publicaciones" }, { label: "Life Score", to: "/life-score" }, { label: "Recomendación", to: "/recomendador", hideForProfessional: true }, { label: "Planes", to: "/planes" }, { label: "Mis favoritos", to: "/favoritos", hideForProfessional: true }];

const SOCIAL_LINKS = [{ icon: Facebook, label: "Facebook" }, { icon: Instagram, label: "Instagram" }, { icon: Youtube, label: "YouTube" }, { icon: Twitter, label: "X" }];

// Footer sitewide de Nidio (inspirado en el de portales como Argenprop). Se
// muestra en todas las páginas, incluido el mapa: al ir dentro de un <main>
// con overflow-auto, en /mapa queda debajo del todo y se ve al scrollear.
export function Footer() {
  const { user } = useAuth();
  const isProfessional = user?.accountType === "PROFESSIONAL";
  const siteLinks = SITE_LINKS.filter(item => !item.hideForProfessional || !isProfessional);
  return <footer className="bg-inverse-surface text-inverse-on-surface mt-16 border-l border-inverse-on-surface/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">
        <div className="space-y-4">
          <img src="/logo.svg" alt="nidio" className="h-7 w-auto brightness-0 invert" />
          <p className="text-sm text-inverse-on-surface/70 max-w-xs">
            Análisis objetivo del mercado inmobiliario de CABA, basado en datos, para que compres, alquiles o vendas
            con certeza.
          </p>
          <div className="space-y-2 pt-2 text-sm">
            <Link to="/terminos" className="block text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors">Términos y condiciones</Link>
            <Link to="/privacidad" className="block text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors">Privacidad y protección de datos</Link>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-bold">Mapa de sitio</h3>
          <ul className="space-y-2.5 text-sm">
            {siteLinks.map(item => <li key={item.to}>
                <Link to={item.to} className="text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors">
                  {item.label}
                </Link>
              </li>)}
          </ul>
        </div>

        <div className="space-y-6">
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Contáctanos</h3>
            <a href="mailto:nidio.propiedades@gmail.com" className="text-sm text-inverse-on-surface/70 hover:text-inverse-on-surface transition-colors flex items-center gap-2">
              <Mail className="w-4 h-4" /> nidio.propiedades@gmail.com
            </a>
          </div>
          <div className="space-y-3">
            <h3 className="text-lg font-bold">Seguinos</h3>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map(({ icon: Icon, label }) => <span key={label} aria-label={label} className="w-9 h-9 rounded-lg bg-inverse-on-surface/10 flex items-center justify-center hover:bg-inverse-on-surface/20 transition-colors cursor-pointer">
                  <Icon className="w-4 h-4" />
                </span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-inverse-on-surface/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 text-xs text-inverse-on-surface/60">
          © {new Date().getFullYear()} Nidio. Todos los derechos reservados.
        </div>
      </div>
    </footer>;
}
