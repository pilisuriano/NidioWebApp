package com.nidio.config;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.access.AccessDeniedException;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Verifica que una cuenta autenticada sin el rol requerido reciba 403 (y no 401),
 * con el mismo formato de error JSON del resto de la API.
 */
class AccessDeniedHandlerJwtTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();
    private final AccessDeniedHandlerJwt handler = new AccessDeniedHandlerJwt(objectMapper);

    @Test
    void accessDeniedReturns403WithJsonBody() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/admin/users");
        MockHttpServletResponse response = new MockHttpServletResponse();

        handler.handle(request, response, new AccessDeniedException("Access Denied"));

        assertEquals(403, response.getStatus());
        assertTrue(response.getContentType().startsWith("application/json"));
        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertEquals(403, body.get("status").asInt());
        assertEquals("Forbidden", body.get("error").asText());
        assertEquals("/api/admin/users", body.get("path").asText());
    }

    @Test
    void unauthenticatedRequestStillReturns401() throws Exception {
        AuthEntryPointJwt entryPoint = new AuthEntryPointJwt(objectMapper);
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/valuations");
        MockHttpServletResponse response = new MockHttpServletResponse();

        entryPoint.commence(request, response,
                new org.springframework.security.authentication.InsufficientAuthenticationException("sin token"));

        assertEquals(401, response.getStatus());
        JsonNode body = objectMapper.readTree(response.getContentAsString());
        assertEquals(401, body.get("status").asInt());
    }
}
