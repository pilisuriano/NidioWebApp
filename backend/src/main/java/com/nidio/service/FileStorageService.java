package com.nidio.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.nidio.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.Set;

/**
 * Sube fotos de propiedades (HU "Publicar") a Cloudinary (plan gratuito) en
 * vez de guardarlas en disco local: Render no tiene disco persistente entre
 * deploys, así que un storage externo es necesario para que las fotos no se
 * pierdan. Credenciales en backend/.env (ver CLOUDINARY_* ahí).
 */
@Slf4j
@Service
public class FileStorageService {

    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final Cloudinary cloudinary;
    private final boolean configured;

    public FileStorageService(
            @Value("${app.cloudinary.cloud-name}") String cloudName,
            @Value("${app.cloudinary.api-key}") String apiKey,
            @Value("${app.cloudinary.api-secret}") String apiSecret
    ) {
        this.configured = cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank();
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    public String storeImage(MultipartFile file) {
        if (!configured) {
            // Pasa antes de intentar la llamada a Cloudinary: sin credenciales
            // el SDK tira una excepción de bajo nivel poco clara (500
            // genérico); esto da un mensaje entendible en su lugar.
            log.warn("Subida de imagen sin CLOUDINARY_CLOUD_NAME/API_KEY/API_SECRET configurados");
            throw new InvalidFileException(
                    "La subida de fotos no está configurada todavía (faltan las credenciales de Cloudinary en el backend)");
        }
        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("El archivo está vacío");
        }
        if (!ALLOWED_CONTENT_TYPES.contains(file.getContentType())) {
            throw new InvalidFileException("Solo se permiten imágenes JPG, PNG o WEBP");
        }

        try {
            Map<?, ?> result = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                    "folder", "nidio/properties",
                    "resource_type", "image"));
            return (String) result.get("secure_url");
        } catch (Exception e) {
            // Amplio a propósito: el SDK de Cloudinary puede tirar tanto
            // IOException (red) como RuntimeException (credenciales
            // inválidas, respuesta inesperada), y en los dos casos queremos
            // el mismo 400 legible en vez del 500 genérico.
            log.error("No se pudo subir la imagen a Cloudinary", e);
            throw new InvalidFileException("No se pudo subir la imagen");
        }
    }
}
