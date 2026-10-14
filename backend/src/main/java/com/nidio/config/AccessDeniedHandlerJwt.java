package com.nidio.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nidio.exception.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;

/**
 * Responde 403 cuando el usuario está autenticado pero no tiene el rol requerido
 * (por ejemplo, una cuenta común que pide /api/admin/**).
 *
 * Sin este handler, la denegación se reenviaba internamente a /error, donde el
 * filtro JWT no vuelve a correr: la request llegaba como anónima y terminaba en
 * AuthEntryPointJwt con un 401 engañoso (el frontend, ante un 401, descarta la
 * sesión). Al escribir la respuesta acá no hay reenvío a /error.
 */
@Component
@RequiredArgsConstructor
public class AccessDeniedHandlerJwt implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    @Override
    public void handle(
            HttpServletRequest request, HttpServletResponse response, AccessDeniedException accessDeniedException
    ) throws IOException, ServletException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpStatus.FORBIDDEN.value());

        ErrorResponse body = new ErrorResponse(
                Instant.now(),
                HttpStatus.FORBIDDEN.value(),
                HttpStatus.FORBIDDEN.getReasonPhrase(),
                "No tenés permisos para acceder a este recurso",
                request.getRequestURI()
        );
        objectMapper.writeValue(response.getWriter(), body);
    }
}
