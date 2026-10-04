package com.padel.reservas.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.padel.reservas.dto.SubidaResult;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private static final String CARPETA_BASE = "padel-calatrava";

    private final Cloudinary cloudinary;

    /**
     * Sube un archivo a Cloudinary con optimización automática a WebP.
     *
     * @param file        archivo recibido del cliente
     * @param subcarpeta  p.ej. "pistas", "sede", "avatares"
     * @param anchoMax    ancho máximo en píxeles (limit crop)
     */
    public SubidaResult subir(MultipartFile file,
                              String subcarpeta,
                              int anchoMax) throws IOException {
        String carpeta = CARPETA_BASE + "/" + subcarpeta;

        Map<?, ?> resultado = cloudinary.uploader().upload(
            file.getBytes(),
            ObjectUtils.asMap(
                "folder",          carpeta,
                "format",          "webp",
                "quality",         "auto",
                "width",           anchoMax,
                "crop",            "limit",
                "resource_type",   "image"
            )
        );

        String url      = (String) resultado.get("secure_url");
        String publicId = (String) resultado.get("public_id");
        return new SubidaResult(url, publicId);
    }

    /**
     * Elimina una imagen de Cloudinary por su publicId.
     * Llamar SIEMPRE antes de borrar la fila de BD para no dejar
     * datos huérfanos (requisito RGPD).
     */
    public void eliminar(String publicId) throws IOException {
        cloudinary.uploader().destroy(
            publicId,
            ObjectUtils.emptyMap()
        );
    }
}
