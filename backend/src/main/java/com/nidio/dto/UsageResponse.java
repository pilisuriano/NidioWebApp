package com.nidio.dto;

// GET /api/usage: cuántos usos le quedan al usuario de cada función (cuota gratis del mes, pase o plan).
public record UsageResponse(UsageStatusDto valuation, UsageStatusDto recommendation, UsageStatusDto lifeScore) {
}
