package com.nidio.controller;

import com.nidio.dto.AddressCheckResponse;
import com.nidio.dto.AddressSuggestionDto;
import com.nidio.service.GeorefClient;
import com.nidio.service.PropertyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// HU "Publicar": autocomplete y validación de dirección (requiere sesión, no
// está en permitAll de SecurityConfig, igual que /api/uploads).
@RestController
@RequestMapping("/api/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final GeorefClient georefClient;
    private final PropertyService propertyService;

    @GetMapping("/search")
    public List<AddressSuggestionDto> search(@RequestParam("q") String query) {
        if (query == null || query.trim().length() < 5) {
            return List.of();
        }
        return georefClient.searchAddresses(query.trim());
    }

    // Chequeo "en vivo" apenas se elige una dirección de la lista, para
    // avisar en el formulario (paso "Principales") si no cae dentro del
    // barrio elegido, sin esperar al submit final (ver Publicar.jsx).
    @GetMapping("/validate")
    public AddressCheckResponse validate(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam Long neighborhoodId
    ) {
        return propertyService.checkAddressInNeighborhood(lat, lon, neighborhoodId);
    }
}
