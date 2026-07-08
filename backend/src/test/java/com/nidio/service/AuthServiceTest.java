package com.nidio.service;

import com.nidio.dto.AuthResponse;
import com.nidio.dto.LoginRequest;
import com.nidio.dto.RegisterRequest;
import com.nidio.exception.EmailAlreadyExistsException;
import com.nidio.exception.InvalidCredentialsException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@Transactional
class AuthServiceTest {

    @Autowired
    private AuthService authService;

    @Test
    void registerCreatesUserAndReturnsToken() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "magui.test@example.com", "SuperSegura123");

        AuthResponse response = authService.register(request);

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUser().getEmail()).isEqualTo("magui.test@example.com");
        assertThat(response.getUser().getName()).isEqualTo("Magui Alfie");
        assertThat(response.getUser().getId()).isNotNull();
    }

    @Test
    void registerWithDuplicateEmailThrowsConflict() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "duplicada@example.com", "SuperSegura123");
        authService.register(request);

        RegisterRequest duplicate = new RegisterRequest("Otro Nombre", "duplicada@example.com", "OtraPass123");

        assertThatThrownBy(() -> authService.register(duplicate))
                .isInstanceOf(EmailAlreadyExistsException.class);
    }

    @Test
    void loginWithInvalidCredentialsThrowsUnauthorized() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "login.test@example.com", "SuperSegura123");
        authService.register(request);

        LoginRequest wrongPassword = new LoginRequest("login.test@example.com", "ContraseñaIncorrecta");
        assertThatThrownBy(() -> authService.login(wrongPassword))
                .isInstanceOf(InvalidCredentialsException.class);

        LoginRequest wrongEmail = new LoginRequest("no-existe@example.com", "SuperSegura123");
        assertThatThrownBy(() -> authService.login(wrongEmail))
                .isInstanceOf(InvalidCredentialsException.class);
    }

    @Test
    void loginWithValidCredentialsReturnsToken() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "login.ok@example.com", "SuperSegura123");
        authService.register(request);

        AuthResponse response = authService.login(new LoginRequest("login.ok@example.com", "SuperSegura123"));

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUser().getEmail()).isEqualTo("login.ok@example.com");
    }
}
