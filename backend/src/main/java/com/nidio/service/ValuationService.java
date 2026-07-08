package com.nidio.service;

import com.nidio.dto.ValuationCreateRequest;
import com.nidio.dto.ValuationResponse;
import com.nidio.dto.ValuationSummaryResponse;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.Neighborhood;
import com.nidio.model.User;
import com.nidio.model.ValuationRequest;
import com.nidio.model.ValuationResult;
import com.nidio.repository.NeighborhoodRepository;
import com.nidio.repository.UserRepository;
import com.nidio.repository.ValuationRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ValuationService {

    private final ValuationRequestRepository valuationRequestRepository;
    private final NeighborhoodRepository neighborhoodRepository;
    private final UserRepository userRepository;
    private final MlServiceClient mlServiceClient;

    @Transactional
    public ValuationResponse createValuation(ValuationCreateRequest request, String userEmail) {
        Neighborhood neighborhood = neighborhoodRepository.findById(request.getNeighborhoodId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No existe el barrio " + request.getNeighborhoodId()));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        MlServiceClient.PredictResponse prediction = mlServiceClient.predict(new MlServiceClient.PredictRequest(
                request.getOperationType(),
                request.getPropertyType(),
                neighborhood.getName(),
                request.getSurfaceM2(),
                request.getRooms()));

        ValuationRequest valuation = ValuationRequest.builder()
                .user(user)
                .operationType(request.getOperationType())
                .propertyType(request.getPropertyType())
                .neighborhood(neighborhood)
                .surfaceM2(request.getSurfaceM2())
                .rooms(request.getRooms())
                .declaredPrice(request.getDeclaredPrice())
                .estimatedMin(prediction.min())
                .estimatedMax(prediction.max())
                .result(compare(request.getDeclaredPrice(), prediction.min(), prediction.max()))
                .build();
        valuation = valuationRequestRepository.save(valuation);

        return toResponse(valuation);
    }

    @Transactional(readOnly = true)
    public ValuationResponse getValuation(Long id, String userEmail) {
        ValuationRequest valuation = valuationRequestRepository.findById(id)
                .filter(v -> v.getUser() != null && v.getUser().getEmail().equals(userEmail))
                .orElseThrow(() -> new ResourceNotFoundException("No existe la valuación " + id));
        return toResponse(valuation);
    }

    @Transactional(readOnly = true)
    public List<ValuationSummaryResponse> listValuations(String userEmail) {
        return valuationRequestRepository.findTop20ByUserEmailOrderByCreatedAtDesc(userEmail).stream()
                .map(v -> new ValuationSummaryResponse(
                        v.getId(),
                        v.getOperationType(),
                        v.getPropertyType(),
                        v.getNeighborhood().getName(),
                        v.getSurfaceM2(),
                        v.getRooms(),
                        v.getDeclaredPrice(),
                        v.getEstimatedMin(),
                        v.getEstimatedMax(),
                        v.getResult(),
                        v.getCreatedAt()))
                .toList();
    }

    private static ValuationResult compare(BigDecimal declaredPrice, BigDecimal min, BigDecimal max) {
        if (declaredPrice == null) {
            return null;
        }
        if (declaredPrice.compareTo(min) < 0) {
            return ValuationResult.UNDERVALUED;
        }
        if (declaredPrice.compareTo(max) > 0) {
            return ValuationResult.OVERVALUED;
        }
        return ValuationResult.FAIR;
    }

    private static ValuationResponse toResponse(ValuationRequest valuation) {
        return new ValuationResponse(
                valuation.getId(),
                valuation.getEstimatedMin(),
                valuation.getEstimatedMax(),
                valuation.getResult(),
                valuation.getCreatedAt());
    }
}
