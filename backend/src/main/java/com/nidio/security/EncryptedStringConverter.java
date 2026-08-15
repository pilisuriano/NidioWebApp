package com.nidio.security;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Cifra/descifra campos sensibles antes de guardarlos en la base, con
 * AES-256-GCM. Se usa solo para "Mis lugares" de Life Score
 * ({@link com.nidio.model.CustomPlace}.address/lat/lon) — son direcciones
 * personales del usuario (dónde vive, dónde trabaja), a diferencia de la
 * dirección de una propiedad publicada, que es pública por diseño y no pasa
 * por acá.
 *
 * Protege contra el acceso directo a la base (credenciales filtradas, un
 * backup mal compartido, alguien con acceso de lectura a Postgres): sin la
 * clave, los valores guardados son ilegibles. No protege contra un
 * compromiso de la aplicación en sí (la clave vive en una variable de
 * entorno que la app necesita para funcionar) — ese es un límite conocido
 * de este enfoque, no un descuido.
 *
 * Una única clave para toda la app (no una por usuario, ver conversación con
 * Pili) — pero cada valor se cifra con un IV (vector de inicialización)
 * aleatorio distinto, así que dos usuarios con la misma dirección exacta NO
 * producen el mismo texto cifrado.
 *
 * Clave: variable de entorno CUSTOM_PLACE_ENCRYPTION_KEY, 32 bytes en
 * base64 (generarla con `openssl rand -base64 32`). Sin default: si falta,
 * el arranque de la app debe fallar fuerte, no usar una clave débil conocida
 * de memoria.
 */
@Component
@Converter
public class EncryptedStringConverter implements AttributeConverter<String, String> {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final SecretKeySpec key;

    public EncryptedStringConverter(@Value("${app.crypto.custom-place-key}") String base64Key) {
        this.key = new SecretKeySpec(Base64.getDecoder().decode(base64Key), "AES");
    }

    @Override
    public String convertToDatabaseColumn(String plainText) {
        if (plainText == null) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_LENGTH_BYTES];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            byte[] cipherText = cipher.doFinal(plainText.getBytes(StandardCharsets.UTF_8));

            byte[] combined = new byte[iv.length + cipherText.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(cipherText, 0, combined, iv.length, cipherText.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo cifrar el campo", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String storedValue) {
        if (storedValue == null) {
            return null;
        }
        try {
            byte[] combined = Base64.getDecoder().decode(storedValue);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            System.arraycopy(combined, 0, iv, 0, IV_LENGTH_BYTES);
            byte[] cipherText = new byte[combined.length - IV_LENGTH_BYTES];
            System.arraycopy(combined, IV_LENGTH_BYTES, cipherText, 0, cipherText.length);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            return new String(cipher.doFinal(cipherText), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo descifrar el campo", e);
        }
    }
}
