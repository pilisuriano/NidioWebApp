package com.nidio.dto;

public record CustomPlaceResponse(Long id, String label, String address, double lat, double lon) {
}
