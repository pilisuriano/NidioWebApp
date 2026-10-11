package com.nidio.controller;

import com.nidio.dto.PropertySummaryResponse;
import com.nidio.model.FeaturedListing;
import com.nidio.service.FeaturedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;

/**
 * Destacados de 7 días. Los GET son públicos (rotulan las tarjetas del catálogo); destacar
 * una publicación pide sesión. Si no quedan créditos incluidos responde 402 y el frontend
 * ofrece pagar el destacado suelto por la pasarela simulada.
 */
@RestController
@RequestMapping("/api/featured")
@RequiredArgsConstructor
public class FeaturedController {

    private final FeaturedService featuredService;

    // startsAt = null arranca ahora; con la fecha que ofreció /availability es una reserva.
    public record ActivateRequest(Long propertyId, Instant startsAt) {
    }

    public record ActivatedResponse(Long propertyId, String source, Instant startsAt, Instant endsAt) {
    }

    @GetMapping("/ids")
    public List<Long> ids() {
        return featuredService.activePropertyIds();
    }

    @GetMapping
    public List<PropertySummaryResponse> list() {
        return featuredService.activeSummaries();
    }

    // Si hoy no hay lugar, la primera fecha en que se libera uno (para ofrecer la reserva).
    @GetMapping("/availability")
    public FeaturedService.Availability availability(@RequestParam Long propertyId, Authentication authentication) {
        return featuredService.availability(authentication.getName(), propertyId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ActivatedResponse activate(@RequestBody ActivateRequest request, Authentication authentication) {
        FeaturedListing listing = featuredService.activateWithCredit(authentication.getName(), request.propertyId(), request.startsAt());
        return new ActivatedResponse(listing.getPropertyId(), listing.getSource().name(), listing.getStartsAt(), listing.getEndsAt());
    }
}
