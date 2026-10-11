package com.nidio.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.Instant;
import java.util.List;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        List<FieldValidationError> errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new FieldValidationError(fe.getField(), fe.getDefaultMessage()))
                .toList();
        ErrorResponse body = new ErrorResponse(
                Instant.now(), 400, "Bad Request", "Error de validación", request.getRequestURI(), errors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(body);
    }

    @ExceptionHandler(InvalidRegistrationException.class)
    public ResponseEntity<ErrorResponse> handleInvalidRegistration(InvalidRegistrationException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidResetTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidResetToken(InvalidResetTokenException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidVerificationTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidVerificationToken(InvalidVerificationTokenException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(EmailNotVerifiedException.class)
    public ResponseEntity<ErrorResponse> handleEmailNotVerified(EmailNotVerifiedException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    // 423 (Locked) y no 403 a propósito: el frontend usa el status 403 de
    // login para saber cuándo ofrecer "reenviar verificación", y una cuenta
    // desactivada por un admin no tiene nada que ver con eso.
    @ExceptionHandler(AccountDisabledException.class)
    public ResponseEntity<ErrorResponse> handleAccountDisabled(AccountDisabledException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.LOCKED, ex.getMessage(), request);
    }

    @ExceptionHandler(AdminOperationException.class)
    public ResponseEntity<ErrorResponse> handleAdminOperation(AdminOperationException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<ErrorResponse> handleInvalidFile(InvalidFileException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSize(MaxUploadSizeExceededException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, "El archivo es muy grande (máx. 5MB)", request);
    }

    @ExceptionHandler(PropertyNotContactableException.class)
    public ResponseEntity<ErrorResponse> handlePropertyNotContactable(PropertyNotContactableException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(PropertyNotFavoritableException.class)
    public ResponseEntity<ErrorResponse> handlePropertyNotFavoritable(PropertyNotFavoritableException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(AddressValidationException.class)
    public ResponseEntity<ErrorResponse> handleAddressValidation(AddressValidationException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(PropertyDeactivatedByAdminException.class)
    public ResponseEntity<ErrorResponse> handlePropertyDeactivatedByAdmin(PropertyDeactivatedByAdminException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    @ExceptionHandler(TooManyCustomPlacesException.class)
    public ResponseEntity<ErrorResponse> handleTooManyCustomPlaces(TooManyCustomPlacesException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 429 (Too Many Requests): se terminaron los usos gratis del mes. El
    // frontend usa este status para mostrar la invitación al plan pago.
    @ExceptionHandler(QuotaExceededException.class)
    public ResponseEntity<ErrorResponse> handleQuotaExceeded(QuotaExceededException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.TOO_MANY_REQUESTS, ex.getMessage(), request);
    }

    @ExceptionHandler(PaymentRequiredException.class)
    public ResponseEntity<ErrorResponse> handlePaymentRequired(PaymentRequiredException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.PAYMENT_REQUIRED, ex.getMessage(), request);
    }

    @ExceptionHandler(BillingConflictException.class)
    public ResponseEntity<ErrorResponse> handleBillingConflict(BillingConflictException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    @ExceptionHandler(MlServiceException.class)
    public ResponseEntity<ErrorResponse> handleMlServiceException(MlServiceException ex, HttpServletRequest request) {
        return errorResponse(HttpStatus.BAD_GATEWAY, ex.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleUnexpected(Exception ex, HttpServletRequest request) {
        // Sin este log el 500 quedaba mudo: el cliente ve "error inesperado" y en la consola no aparecía nada.
        log.error("Error inesperado en {} {}", request.getMethod(), request.getRequestURI(), ex);
        return errorResponse(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado", request);
    }

    private ResponseEntity<ErrorResponse> errorResponse(HttpStatus status, String message, HttpServletRequest request) {
        ErrorResponse body = new ErrorResponse(
                Instant.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI());
        return ResponseEntity.status(status).body(body);
    }
}
