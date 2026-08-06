package com.nidio.service;

import com.nidio.dto.AuthResponse;
import com.nidio.dto.LoginRequest;
import com.nidio.dto.MessageResponse;
import com.nidio.dto.RegisterRequest;
import com.nidio.exception.EmailAlreadyExistsException;
import com.nidio.exception.EmailNotVerifiedException;
import com.nidio.exception.InvalidCredentialsException;
import com.nidio.model.User;
import com.nidio.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    @Test
    void registerCreatesUnverifiedUser() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "magui.test@example.com", "SuperSegura123");

        MessageResponse response = authService.register(request);

        assertThat(response.getMessage()).isNotBlank();
        User created = userRepository.findByEmail("magui.test@example.com").orElseThrow();
        assertThat(created.getName()).isEqualTo("Magui Alfie");
        assertThat(created.isEmailVerified()).isFalse();
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
    void loginWithUnverifiedEmailThrowsForbidden() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "sinverificar@example.com", "SuperSegura123");
        authService.register(request);

        assertThatThrownBy(() -> authService.login(new LoginRequest("sinverificar@example.com", "SuperSegura123")))
                .isInstanceOf(EmailNotVerifiedException.class);
    }

    @Test
    void loginWithValidCredentialsReturnsToken() {
        RegisterRequest request = new RegisterRequest("Magui Alfie", "login.ok@example.com", "SuperSegura123");
        authService.register(request);

        // El registro no verifica el email automáticamente: para probar el
        // login exitoso simulamos que el usuario ya confirmó su cuenta.
        User user = userRepository.findByEmail("login.ok@example.com").orElseThrow();
        user.setEmailVerified(true);
        userRepository.save(user);

        AuthResponse response = authService.login(new LoginRequest("login.ok@example.com", "SuperSegura123"));

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUser().getEmail()).isEqualTo("login.ok@example.com");
    }
}
