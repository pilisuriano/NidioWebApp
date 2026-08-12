package com.nidio.service;

import com.nidio.config.JwtService;
import com.nidio.dto.AuthResponse;
import com.nidio.dto.ForgotPasswordRequest;
import com.nidio.dto.LoginRequest;
import com.nidio.dto.MessageResponse;
import com.nidio.dto.RegisterRequest;
import com.nidio.dto.ResendVerificationRequest;
import com.nidio.dto.ResetPasswordRequest;
import com.nidio.dto.UserResponse;
import com.nidio.dto.VerifyEmailRequest;
import com.nidio.exception.AccountDisabledException;
import com.nidio.exception.EmailAlreadyExistsException;
import com.nidio.exception.EmailNotVerifiedException;
import com.nidio.exception.InvalidCredentialsException;
import com.nidio.exception.InvalidRegistrationException;
import com.nidio.exception.InvalidResetTokenException;
import com.nidio.exception.InvalidVerificationTokenException;
import com.nidio.exception.ResourceNotFoundException;
import com.nidio.model.EmailVerificationToken;
import com.nidio.model.PasswordResetToken;
import com.nidio.model.User;
import com.nidio.repository.EmailVerificationTokenRepository;
import com.nidio.repository.PasswordResetTokenRepository;
import com.nidio.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Slf4j
@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JavaMailSender mailSender;
    private final String mailFrom;
    private final String passwordResetUrlBase;
    private final String emailVerificationUrlBase;

    public AuthService(
            UserRepository userRepository,
            PasswordResetTokenRepository passwordResetTokenRepository,
            EmailVerificationTokenRepository emailVerificationTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            JavaMailSender mailSender,
            @Value("${app.mail.from}") String mailFrom,
            @Value("${app.mail.password-reset-url-base}") String passwordResetUrlBase,
            @Value("${app.mail.verification-url-base}") String emailVerificationUrlBase
    ) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailVerificationTokenRepository = emailVerificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.mailSender = mailSender;
        this.mailFrom = mailFrom;
        this.passwordResetUrlBase = passwordResetUrlBase;
        this.emailVerificationUrlBase = emailVerificationUrlBase;
    }

    @Transactional
    public MessageResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("El email ya está registrado");
        }

        com.nidio.model.AccountType accountType = request.getAccountType() != null
                ? request.getAccountType() : com.nidio.model.AccountType.PERSONAL;

        // Los datos fiscales/de rubro no se pueden marcar @NotBlank en el DTO
        // (son opcionales para una cuenta PERSONAL) — se validan acá porque
        // solo son obligatorios para una cuenta PROFESSIONAL.
        if (accountType == com.nidio.model.AccountType.PROFESSIONAL) {
            if (request.getProfessionalType() == null) {
                throw new InvalidRegistrationException("Elegí un tipo de usuario para la cuenta profesional");
            }
            if (request.getBusinessName() == null || request.getBusinessName().isBlank()) {
                throw new InvalidRegistrationException("La razón social es obligatoria para una cuenta profesional");
            }
            if (request.getTaxCondition() == null) {
                throw new InvalidRegistrationException("Elegí una condición fiscal para la cuenta profesional");
            }
            if (request.getCuit() == null || request.getCuit().isBlank()) {
                throw new InvalidRegistrationException("El CUIT es obligatorio para una cuenta profesional");
            }
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .accountType(accountType)
                .professionalType(accountType == com.nidio.model.AccountType.PROFESSIONAL ? request.getProfessionalType() : null)
                .businessName(accountType == com.nidio.model.AccountType.PROFESSIONAL ? request.getBusinessName() : null)
                .taxCondition(accountType == com.nidio.model.AccountType.PROFESSIONAL ? request.getTaxCondition() : null)
                .cuit(accountType == com.nidio.model.AccountType.PROFESSIONAL ? request.getCuit() : null)
                .phone(request.getPhone())
                .mobilePhone(request.getMobilePhone())
                .build();
        user = userRepository.save(user);

        issueVerificationToken(user);

        return new MessageResponse(
                "Cuenta creada. Te enviamos un mail para verificar tu cuenta antes de iniciar sesión.");
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Email o contraseña incorrectos"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("Email o contraseña incorrectos");
        }

        if (!user.isEmailVerified()) {
            throw new EmailNotVerifiedException("Tenés que verificar tu email antes de iniciar sesión");
        }

        if (!user.isActive()) {
            throw new AccountDisabledException(
                    "Tu cuenta fue desactivada. Contactate con soporte (soporte.nidio@gmail.com) para más información");
        }

        String token = jwtService.generateToken(user.getEmail());
        return new AuthResponse(token, toUserResponse(user));
    }

    @Transactional
    public MessageResponse verifyEmail(VerifyEmailRequest request) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(request.getToken())
                .filter(t -> !t.isUsed() && t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new InvalidVerificationTokenException("El link no existe, expiró o ya fue usado"));

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationToken.setUsed(true);
        emailVerificationTokenRepository.save(verificationToken);

        return new MessageResponse("Email verificado correctamente. Ya podés iniciar sesión.");
    }

    @Transactional
    public MessageResponse resendVerification(ResendVerificationRequest request) {
        userRepository.findByEmail(request.getEmail())
                .filter(user -> !user.isEmailVerified())
                .ifPresent(this::issueVerificationToken);

        // Mismo criterio que forgotPassword: no confirma si el email existe o
        // ya está verificado, para no filtrar esa información.
        return new MessageResponse("Si el email existe y no está verificado, vas a recibir un nuevo link.");
    }

    // Variante para el panel de administración (HU nueva: reenviar verificación
    // manualmente si el mail original falló). A diferencia de resendVerification(),
    // acá el admin ya eligió un usuario puntual desde /api/admin/users, así que no
    // hace falta el criterio de "no confirmar si el email existe" — eso lo valida
    // AdminService antes de llamar a este método.
    @Transactional
    public void resendVerificationForUser(User user) {
        issueVerificationToken(user);
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String rawToken = UUID.randomUUID().toString();
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .user(user)
                    .token(rawToken)
                    .expiresAt(Instant.now().plus(1, ChronoUnit.HOURS))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);
            sendResetEmail(user, rawToken);
        });

        return new MessageResponse("Si el email existe, vas a recibir un link de recuperación.");
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .filter(t -> !t.isUsed() && t.getExpiresAt().isAfter(Instant.now()))
                .orElseThrow(() -> new InvalidResetTokenException("El token no existe, expiró o ya fue usado"));

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        return new MessageResponse("Contraseña actualizada correctamente.");
    }

    public UserResponse getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return toUserResponse(user);
    }

    // name es @NotBlank en el DTO, así que siempre viene y se pisa directo.
    // dni/phone/logoUrl son opcionales: antes se pisaban sin condición, lo
    // que borraba el dato existente en cualquier caller que no los mandara
    // (ej. el formulario de contacto de PropertyDetail, que solo actualiza
    // nombre/teléfono). Ahora solo se tocan si vienen en el request.
    @Transactional
    public UserResponse updateProfile(String email, com.nidio.dto.UpdateProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        user.setName(request.getName());
        if (request.getDni() != null) {
            user.setDni(request.getDni());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getLogoUrl() != null) {
            user.setLogoUrl(request.getLogoUrl());
        }
        if (request.getBusinessName() != null) {
            user.setBusinessName(request.getBusinessName());
        }
        if (request.getCuit() != null) {
            user.setCuit(request.getCuit());
        }
        user = userRepository.save(user);
        return toUserResponse(user);
    }

    private void sendResetEmail(User user, String rawToken) {
        try {
            String link = passwordResetUrlBase + "?token=" + rawToken;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject("Recuperación de contraseña - Nidio");
            message.setText("Para restablecer tu contraseña, ingresá al siguiente link: " + link);
            mailSender.send(message);
        } catch (MailException e) {
            log.warn("No se pudo enviar el email de recuperación a {}", user.getEmail(), e);
        }
    }

    // Genera un token nuevo (válido 24hs) y manda el mail de verificación.
    // Usado tanto en register() como en resendVerification().
    private void issueVerificationToken(User user) {
        String rawToken = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = EmailVerificationToken.builder()
                .user(user)
                .token(rawToken)
                .expiresAt(Instant.now().plus(24, ChronoUnit.HOURS))
                .used(false)
                .build();
        emailVerificationTokenRepository.save(verificationToken);
        sendVerificationEmail(user, rawToken);
    }

    private void sendVerificationEmail(User user, String rawToken) {
        try {
            String link = emailVerificationUrlBase + "?token=" + rawToken;
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(mailFrom);
            message.setTo(user.getEmail());
            message.setSubject("Verificá tu email - Nidio");
            message.setText("¡Gracias por registrarte en Nidio! Para activar tu cuenta, ingresá al siguiente link: "
                    + link + "\n\nEl link vence en 24 horas.");
            mailSender.send(message);
        } catch (MailException e) {
            log.warn("No se pudo enviar el email de verificación a {}", user.getEmail(), e);
        }
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(), user.getName(), user.getEmail(), user.getDni(), user.getPhone(),
                user.getRole().name(),
                user.getAccountType().name(),
                user.getProfessionalType() != null ? user.getProfessionalType().name() : null,
                user.getBusinessName(),
                user.getTaxCondition() != null ? user.getTaxCondition().name() : null,
                user.getCuit(),
                user.getMobilePhone(),
                user.getLogoUrl());
    }
}
