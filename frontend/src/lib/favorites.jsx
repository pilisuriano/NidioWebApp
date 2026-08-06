import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { api, apiErrorMessage } from "./api";
import { useAuth } from "./auth";

/**
 * Estado de "Mis favoritos" compartido en toda la app: se carga una sola vez
 * (el set de IDs favoritos) y cualquier corazón — en el mapa, el listado o
 * el detalle — lee/escribe de acá, así togglear en un lugar se refleja al
 * toque en todos los demás sin tener que refetchear.
 */
const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set());
      return;
    }
    api.get("/api/favorites/ids").then(res => setFavoriteIds(new Set(res.data))).catch(() => setFavoriteIds(new Set()));
  }, [user]);

  const isFavorite = useCallback(id => favoriteIds.has(id), [favoriteIds]);

  const toggleFavorite = useCallback(async id => {
    const wasFavorite = favoriteIds.has(id);
    // Actualización optimista (el corazón cambia al toque); si el pedido
    // falla, se revierte.
    setFavoriteIds(prev => {
      const next = new Set(prev);
      if (wasFavorite) next.delete(id); else next.add(id);
      return next;
    });
    try {
      if (wasFavorite) {
        await api.delete(`/api/properties/${id}/favorite`);
      } else {
        await api.post(`/api/properties/${id}/favorite`);
      }
    } catch (err) {
      setFavoriteIds(prev => {
        const next = new Set(prev);
        if (wasFavorite) next.add(id); else next.delete(id);
        return next;
      });
      if (!wasFavorite) {
        toast.error(apiErrorMessage(err, "No se pudo agregar a favoritos"));
      }
    }
  }, [favoriteIds]);

  return <FavoritesContext.Provider value={{ isFavorite, toggleFavorite, favoriteCount: favoriteIds.size }}>
      {children}
    </FavoritesContext.Provider>;
}

export function useFavorites() {
  const ctx = useContext(FavoritesContext);
  if (!ctx) {
    throw new Error("useFavorites debe usarse dentro de <FavoritesProvider>");
  }
  return ctx;
}
