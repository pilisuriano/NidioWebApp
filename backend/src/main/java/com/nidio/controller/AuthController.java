package com.nidio.controller;

import com.nidio.dto.AuthResponse;
import com.nidio.dto.ForgotPasswordRequest;
import com.nidio.dto.LoginRequest;
import com.nidio.dto.MessageResponse;
import com.nidio.dto.RegisterRequest;
import com.nidio.dto.ResendVerificationRequest;
import com.nidio.dto.ResetPasswordRequest;
import com.nidio.dto.UpdateProfileRequest;
import com.nidio.dto.UserResponse;
import com.nidio.dto.VerifyEmailRequest;
import com.nidio.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public MessageResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/verify-email")
    public MessageResponse verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return authService.verifyEmail(request);
    }

    @PostMapping("/resend-verification")
    public MessageResponse resendVerification(@Valid @RequestBody ResendVerificationRequest request) {
        return authService.resendVerification(request);
    }

    @PostMapping("/forgot-password")
    public MessageResponse forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public MessageResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/logout")
    @ResponseStatus(HttpStatus.OK)
    public void logout() {
        // Decisión de arquitectura (ver docs/api/endpoints.md): sin blacklist, el cliente descarta el JWT.
    }

    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }

    @PatchMapping("/me")
    public UserResponse updateMe(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(authentication.getName(), request);
    }
}
