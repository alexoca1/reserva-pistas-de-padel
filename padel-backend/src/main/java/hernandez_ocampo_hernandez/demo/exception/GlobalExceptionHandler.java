package hernandez_ocampo_hernandez.demo.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
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


    // Manejo de excepciones no contoroladas. Para desarrollo. En producción mostraríamos un mensaje de error genérico.
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String,String>> handleGlobalException(Exception ex) {
        ex.printStackTrace();   //Para ver toda la traza del error en la consola
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("Error",ex.toString()));
    }
}
