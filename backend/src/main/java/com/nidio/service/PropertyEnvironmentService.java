package com.nidio.service;

import com.nidio.dto.PropertyEnvironmentResponse;
import com.nidio.model.Property;
import com.nidio.model.PropertyNoise;
import com.nidio.repository.PropertyNoiseRepository;
import com.nidio.repository.PropertyRepository;
import com.nidio.repository.SecurityZoneRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * Arma el entorno (ruido día/noche y seguridad del barrio) de un lote de
 * propiedades con tres consultas, para que el listado no haga una llamada por
 * tarjeta.
 */
@Service
@RequiredArgsConstructor
public class PropertyEnvironmentService {

    /** Tope de ids por pedido: una página de listado o de favoritos entra de sobra. */
    public static final int MAX_IDS = 100;

    static final String[] NOISE_LABELS = {"Tranquilo", "Moderado", "Ruidoso", "Muy ruidoso"};
    static final String[] SECURITY_LABELS = {"Alta", "Media-alta", "Media-baja", "Baja"};

    private final PropertyRepository propertyRepository;
    private final PropertyNoiseRepository propertyNoiseRepository;
    private final SecurityZoneRepository securityZoneRepository;

    @Transactional(readOnly = true)
    public List<PropertyEnvironmentResponse> getEnvironment(List<Long> ids) {
        List<Long> distinct = ids.stream().distinct().limit(MAX_IDS).toList();
        if (distinct.isEmpty()) {
            return List.of();
        }
        Map<Long, Property> properties = propertyRepository.findAllById(distinct).stream()
                .collect(Collectors.toMap(Property::getId, Function.identity()));
        Map<Long, PropertyNoise> noise = propertyNoiseRepository.findByPropertyIdIn(distinct).stream()
                .collect(Collectors.toMap(PropertyNoise::getPropertyId, Function.identity(), (a, b) -> a));
        Map<Long, BigDecimal> securityByNeighborhood = new HashMap<>();
        for (Object[] row : securityZoneRepository.findSecurityIndexByNeighborhood()) {
            securityByNeighborhood.put((Long) row[0], (BigDecimal) row[1]);
        }

        Map<Long, PropertyEnvironmentResponse> result = new LinkedHashMap<>();
        for (Long id : distinct) {
            Property property = properties.get(id);
            if (property == null) {
                continue;
            }
            PropertyNoise n = noise.get(id);
            BigDecimal index = property.getNeighborhood() != null
                    ? securityByNeighborhood.get(property.getNeighborhood().getId())
                    : null;
            result.put(id, new PropertyEnvironmentResponse(
                    id,
                    n == null ? null : noiseOf(n.getDayLevel(), n.getDayDbLow(), n.getDayDbHigh(), n.getDaySrc()),
                    n == null ? null : noiseOf(n.getNightLevel(), n.getNightDbLow(), n.getNightDbHigh(), n.getNightSrc()),
                    securityOf(index)));
        }
        return List.copyOf(result.values());
    }

    static PropertyEnvironmentResponse.Noise noiseOf(Integer level, Integer low, Integer high, String source) {
        if (level == null || level < 1 || level > NOISE_LABELS.length) {
            return null;
        }
        return new PropertyEnvironmentResponse.Noise(level, NOISE_LABELS[level - 1], low, high, source);
    }

    /**
     * El índice (0-100, más alto = más seguro; ver V38) se agrupa en 4 niveles con
     * cortes fijos en 75 / 50 / 25: el índice es de tipo percentil entre los 48 barrios,
     * así que cada nivel agrupa aproximadamente un cuarto de la ciudad.
     */
    static PropertyEnvironmentResponse.Security securityOf(BigDecimal index) {
        if (index == null) {
            return null;
        }
        double value = index.doubleValue();
        int level = value >= 75 ? 1 : value >= 50 ? 2 : value >= 25 ? 3 : 4;
        return new PropertyEnvironmentResponse.Security(level, SECURITY_LABELS[level - 1], index);
    }
}
