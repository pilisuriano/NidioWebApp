package com.nidio.controller;

import com.nidio.dto.CustomPlaceRequest;
import com.nidio.dto.CustomPlaceResponse;
import com.nidio.service.CustomPlaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// "Mis lugares" (Life Score): CRUD de direcciones personales que el usuario
// agrega a mano para sumarlas al cálculo. Requiere sesión — no está en
// permitAll de SecurityConfig, cae en anyRequest().authenticated().
@RestController
@RequestMapping("/api/custom-places")
@RequiredArgsConstructor
public class CustomPlaceController {

    private final CustomPlaceService customPlaceService;

    @GetMapping
    public List<CustomPlaceResponse> list(Authentication authentication) {
        return customPlaceService.list(authentication.getName());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomPlaceResponse create(@Valid @RequestBody CustomPlaceRequest request, Authentication authentication) {
        return customPlaceService.create(request, authentication.getName());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication authentication) {
        customPlaceService.delete(id, authentication.getName());
    }
}
