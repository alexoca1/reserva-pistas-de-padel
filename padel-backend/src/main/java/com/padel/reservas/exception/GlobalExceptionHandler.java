package com.padel.reservas.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {
    // Manejo de errores de validación (@Blanck, @Email, etc. en entidades y @Valid en controladores)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();

        //Guardamos en el Map errores todos los campos y mensajes de error que han fallado
        ex.getBindingResult().getFieldErrors().forEach(error -> {
            errores.put(error.getField(),error.getDefaultMessage());
        });
        //Devolvemos el Map que se transforma en un JSON automáticamente
        return ResponseEntity.badRequest().body(errores);
    }


    // Manejo de acceso denegado por Spring Security (@PreAuthorize, @NoDemoAdmin, etc.)
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, String>> handleAccessDeniedException(org.springframework.security.access.AccessDeniedException ex) {
        String mensaje = (ex.getMessage() != null && !ex.getMessage().isBlank() && !ex.getMessage().equals("Access Denied"))
                ? ex.getMessage()
                : "Acceso denegado: no tienes permisos suficientes";
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("error", mensaje));
    }

    @ExceptionHandler(ReservaSolapadaException.class)
    public ResponseEntity<Map<String, String>> handleReservaSolapada(ReservaSolapadaException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(PistaEnMantenimientoException.class)
    public ResponseEntity<Map<String, String>> handlePistaEnMantenimiento(PistaEnMantenimientoException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode()).body(Map.of("error", ex.getReason() != null ? ex.getReason() : ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.bind.MissingServletRequestParameterException.class)
    public ResponseEntity<Map<String, String>> handleMissingParams(org.springframework.web.bind.MissingServletRequestParameterException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }

    // Manejo de excepciones no controladas. Para desarrollo. En producción mostraríamos un mensaje de error genérico.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handleGlobalException(Exception ex) {
        ex.printStackTrace();   //Para ver toda la traza del error en la consola
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("Error",ex.toString()));
    }
}
