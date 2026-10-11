package com.nidio.exception;

// Una compra o un destacado que no se puede hacer en este momento (ya tiene el plan,
// no corresponde a su tipo de cuenta, no hay cupo, etc.). Responde 409.
public class BillingConflictException extends RuntimeException {

    public BillingConflictException(String message) {
        super(message);
    }
}
