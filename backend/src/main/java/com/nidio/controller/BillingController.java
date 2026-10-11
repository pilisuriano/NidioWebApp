package com.nidio.controller;

import com.nidio.dto.BillingSummaryDto;
import com.nidio.dto.CatalogItemDto;
import com.nidio.dto.CheckoutRequest;
import com.nidio.dto.PaymentDto;
import com.nidio.dto.SimulatePaymentRequest;
import com.nidio.service.BillingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Planes, pase de análisis, packs y destacados con pasarela SIMULADA (sin datos de tarjeta).
 * El catálogo es público (la página de planes se puede ver sin sesión); el resto pide sesión.
 */
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @GetMapping("/catalog")
    public List<CatalogItemDto> catalog() {
        return billingService.catalog();
    }

    @GetMapping("/summary")
    public BillingSummaryDto summary(Authentication authentication) {
        return billingService.summary(authentication.getName());
    }

    @GetMapping("/payments")
    public List<PaymentDto> payments(Authentication authentication) {
        return billingService.listPayments(authentication.getName());
    }

    // Paso 1: crea el pago PENDING (no activa nada todavía).
    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentDto checkout(@Valid @RequestBody CheckoutRequest request, Authentication authentication) {
        return billingService.createCheckout(authentication.getName(), request.getItemCode(), request.getPropertyId(), request.getFeaturedStartsAt());
    }

    // Paso 2: "simular pago aprobado / rechazado".
    @PostMapping("/payments/{id}/simulate")
    public PaymentDto simulate(
            @PathVariable Long id, @RequestBody SimulatePaymentRequest request, Authentication authentication
    ) {
        return billingService.resolvePayment(authentication.getName(), id, request.isApproved());
    }
}
