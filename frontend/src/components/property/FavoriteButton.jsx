import { Heart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";
import { cn } from "@/lib/utils";

/**
 * Corazón de favorito, reusado en tarjetas (mapa, listado) y en el detalle.
 * preventDefault/stopPropagation porque casi siempre vive adentro de un
 * <Link>/<Card onClick> que navega a la propiedad — tocar el corazón no
 * tiene que abrir el aviso.
 */
export function FavoriteButton({ propertyId, ownerEmail, className }) {
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();
  const active = isFavorite(propertyId);

  // Las cuentas profesionales (inmobiliaria/broker/desarrollador) publican
  // avisos, no los guardan como comprador/inquilino — perfil más profesional,
  // sin la función de favoritos.
  if (user?.accountType === "PROFESSIONAL") return null;

  // No tiene sentido guardarse a uno mismo como favorito. ownerEmail solo
  // llega cuando el llamador lo tiene a mano (detalle de la propiedad); el
  // backend rechaza igual el pedido si esta tarjeta viene de un listado que
  // no lo trae (ver PropertyService.addFavorite).
  if (user?.email && ownerEmail && user.email.toLowerCase() === ownerEmail.toLowerCase()) return null;

  function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate("/auth/login");
      return;
    }
    toggleFavorite(propertyId);
  }

  return <button type="button" onClick={handleClick} aria-label={active ? "Quitar de favoritos" : "Agregar a favoritos"} aria-pressed={active} className={cn("w-8 h-8 rounded-full bg-surface-container-lowest/90 backdrop-blur flex items-center justify-center shadow-sm hover:bg-surface-container-lowest transition-colors shrink-0", className)}>
      <Heart className={cn("w-4 h-4 transition-colors", active ? "fill-alert-price text-alert-price" : "text-on-surface")} />
    </button>;
}
