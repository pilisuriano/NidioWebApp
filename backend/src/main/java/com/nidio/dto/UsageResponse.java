package com.nidio.dto;

// GET /api/usage: cuántos usos gratis le quedan al usuario este mes.
public record UsageResponse(UsageStatusDto valuation, UsageStatusDto recommendation) {
}
