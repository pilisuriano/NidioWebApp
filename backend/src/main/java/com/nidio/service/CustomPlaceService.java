package com.nidio.service;

import com.nidio.dto.CustomPlaceRequest;
import com.nidio.dto.CustomPlaceResponse;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.exception.TooManyCustomPlacesException;
import com.nidio.model.CustomPlace;
import com.nidio.model.User;
import com.nidio.repository.CustomPlaceRepository;
import com.nidio.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

// "Mis lugares" (Life Score): direcciones personales que el usuario agrega a
// mano para sumarlas al cálculo además de las 7 categorías fijas de POIs
// (ver LifeScoreService.scoreCustomPlaces, que las lee vía CustomPlaceRepository).
// address/lat/lon se guardan y leen cifrados de forma transparente (JPA
// AttributeConverter, ver EncryptedStringConverter) — este servicio siempre
// trabaja con los valores ya en texto plano, el cifrado pasa en el mapeo a la
// base, no acá.
@Service
@RequiredArgsConstructor
public class CustomPlaceService {

    // Tope prudente: evita abusos y mantiene acotado el costo de recalcular
    // Life Score (cada lugar personal suma un Haversine más por consulta).
    // No es un límite técnico real (15 Haversine son insignificantes) sino
    // una cota de sentido común para que nadie cargue cientos de lugares.
    private static final int MAX_PLACES_PER_USER = 15;

    private final CustomPlaceRepository customPlaceRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<CustomPlaceResponse> list(String userEmail) {
        return customPlaceRepository.findByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(CustomPlaceService::toResponse)
                .toList();
    }

    @Transactional
    public CustomPlaceResponse create(CustomPlaceRequest request, String userEmail) {
        if (customPlaceRepository.countByUserEmail(userEmail) >= MAX_PLACES_PER_USER) {
            throw new TooManyCustomPlacesException(
                    "Ya alcanzaste el máximo de " + MAX_PLACES_PER_USER + " lugares personales");
        }
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        CustomPlace place = CustomPlace.builder()
                .user(user)
                .label(request.label())
                .address(request.address())
                .lat(String.valueOf(request.lat()))
                .lon(String.valueOf(request.lon()))
                .build();
        return toResponse(customPlaceRepository.save(place));
    }

    @Transactional
    public void delete(Long id, String userEmail) {
        if (customPlaceRepository.findByIdAndUserEmail(id, userEmail).isEmpty()) {
            throw new ResourceNotFoundException("Lugar no encontrado");
        }
        customPlaceRepository.deleteByIdAndUserEmail(id, userEmail);
    }

    private static CustomPlaceResponse toResponse(CustomPlace place) {
        return new CustomPlaceResponse(
                place.getId(), place.getLabel(), place.getAddress(),
                Double.parseDouble(place.getLat()), Double.parseDouble(place.getLon()));
    }
}
