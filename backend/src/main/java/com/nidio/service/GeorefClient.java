package com.nidio.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.nidio.dto.AddressSuggestionDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Cliente HTTP hacia georef.ar (API pública y gratuita de datos.gob.ar), para
 * autocompletar y validar direcciones al publicar una propiedad (ver
 * AddressController y PropertyService.createProperty). No es scraping: es la
 * API oficial de datos abiertos del Estado argentino, pensada justamente para
 * uso público — no tiene nada que ver con los portales inmobiliarios (Ley
 * 25.326 / términos de Zonaprop-Argenprop-MercadoLibre no aplican acá).
 */
@Component
public class GeorefClient {

    private static final Logger log = LoggerFactory.getLogger(GeorefClient.class);

    private static final String CABA_PROVINCIA = "Ciudad Autónoma de Buenos Aires";

    // Preposiciones/artículos que en un nombre de calle argentino van en
    // minúscula ("Montes de Oca", no "Montes De Oca").
    private static final Set<String> LOWERCASE_WORDS = Set.of("de", "del", "la", "las", "los", "y");

    private final RestClient restClient;

    public GeorefClient(@Value("${app.georef.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        requestFactory.setConnectTimeout(Duration.ofSeconds(2));
        requestFactory.setReadTimeout(Duration.ofSeconds(5));
        this.restClient = RestClient.builder()
                .baseUrl(baseUrl)
                .requestFactory(requestFactory)
                .build();
    }

    // Solo se leen los campos que se usan; georef devuelve bastantes más
    // (altura, calle, departamento/comuna, provincia, cantidad/inicio/
    // parametros/total a nivel raíz...) -- @JsonIgnoreProperties(ignoreUnknown
    // = true) es IMPRESCINDIBLE acá: por defecto Jackson NO ignora campos no
    // declarados, falla. Sin esta anotación, cualquier campo nuevo que georef
    // agregue a su respuesta (pasó real el 17/08/2026: agregaron cantidad/
    // inicio/parametros/total a nivel raíz) rompe el parseo silenciosamente
    // -- la excepción cae en el catch de mas abajo y el autocomplete deja de
    // traer resultados sin ningún error visible ni logueado.
    @JsonIgnoreProperties(ignoreUnknown = true)
    private record DireccionesResponse(List<Direccion> direcciones) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Direccion(String nomenclatura, Ubicacion ubicacion) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    private record Ubicacion(double lat, double lon) {
    }

    /**
     * Hasta 6 direcciones candidatas de CABA para el texto dado (autocomplete
     * de "Publicar"). Si georef no responde o no encuentra nada, devuelve
     * lista vacía en vez de propagar el error: el buscador de direcciones no
     * tiene por qué tirar abajo el formulario.
     *
     * Georef puede devolver varias entradas con la MISMA "nomenclatura" (ej.
     * al buscar solo por calle sin altura, devuelve un punto por cada tramo/
     * cuadra; incluso con altura a veces hay 2 puntos casi idénticos). Se
     * deduplica por nomenclatura y se queda con la primera ocurrencia, tanto
     * para no repetir la misma opción varias veces en el dropdown como para
     * no romper el "key" de React en el listado.
     */
    public List<AddressSuggestionDto> searchAddresses(String query) {
        try {
            DireccionesResponse response = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/direcciones")
                            .queryParam("direccion", query)
                            .queryParam("provincia", CABA_PROVINCIA)
                            .queryParam("max", 15)
                            .build())
                    .retrieve()
                    .body(DireccionesResponse.class);
            if (response == null || response.direcciones() == null) {
                return List.of();
            }
            Map<String, AddressSuggestionDto> byLabel = new LinkedHashMap<>();
            for (Direccion d : response.direcciones()) {
                if (d.nomenclatura() == null || d.ubicacion() == null) continue;
                byLabel.putIfAbsent(d.nomenclatura(), new AddressSuggestionDto(humanize(d.nomenclatura()), d.ubicacion().lat(), d.ubicacion().lon()));
            }
            return byLabel.values().stream().limit(6).toList();
        } catch (RestClientException e) {
            // No se propaga -- el buscador de direcciones no tiene por qué
            // tirar abajo el formulario -- pero SÍ se loguea, para no volver
            // a quedar a ciegas la próxima vez que georef falle o cambie de
            // forma (ver bug del 17/08/2026: faltaba este log por completo).
            log.warn("Fallo la busqueda de direcciones en georef.ar para query '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    // Georef devuelve la calle en MAYÚSCULA ("AV MANUEL A MONTES DE OCA
    // 1234, Comuna 4, Ciudad Autónoma de Buenos Aires") pero el resto (comuna,
    // provincia) ya viene bien escrito. Solo se le pone Title Case a la parte
    // antes de la primera coma (la calle+altura), dejando el resto igual.
    private static String humanize(String nomenclatura) {
        int commaIndex = nomenclatura.indexOf(',');
        String streetPart = commaIndex < 0 ? nomenclatura : nomenclatura.substring(0, commaIndex);
        String rest = commaIndex < 0 ? "" : nomenclatura.substring(commaIndex);
        return titleCase(streetPart) + rest;
    }

    private static String titleCase(String text) {
        String[] words = text.toLowerCase().split(" ");
        StringBuilder result = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            if (word.isEmpty()) continue;
            if (result.length() > 0) result.append(" ");
            if (i > 0 && LOWERCASE_WORDS.contains(word)) {
                result.append(word);
            } else {
                result.append(Character.toUpperCase(word.charAt(0))).append(word.substring(1));
            }
        }
        return result.toString();
    }
}
