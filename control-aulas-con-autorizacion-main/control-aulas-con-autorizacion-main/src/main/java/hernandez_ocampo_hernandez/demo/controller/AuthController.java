package hernandez_ocampo_hernandez.demo.controller;

import hernandez_ocampo_hernandez.demo.dto.LoginRequest;
import hernandez_ocampo_hernandez.demo.dto.RegisterRequest;
import hernandez_ocampo_hernandez.demo.entities.Usuario;
import hernandez_ocampo_hernandez.demo.repositories.UsuarioRepository;
import hernandez_ocampo_hernandez.demo.services.JwtService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
            );

            String token = jwtService.generateToken(authentication);
            return ResponseEntity.ok(Map.of("token", token));

        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en el servidor"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            if (usuarioRepository.findByEmail(registerRequest.email()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "El email ya está registrado"));
            }

            Usuario usuario = new Usuario();
            usuario.setEmail(registerRequest.email());
            usuario.setPassword(passwordEncoder.encode(registerRequest.password()));
            usuario.setNombre(registerRequest.nombre());
            usuario.setApellidos(registerRequest.apellidos());
            usuario.setRoles("ROLE_USER");
            usuario.setEnabled(true);

            usuarioRepository.save(usuario);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Usuario registrado correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al registrar usuario"));
        }
    }

    // ENDPOINT PARA REGISTRAR ADMINISTRADORES
    // Este endpoint debería estar protegido en producción o ser temporal
    @PostMapping("/register-admin")
    public ResponseEntity<?> registerAdmin(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            if (usuarioRepository.findByEmail(registerRequest.email()).isPresent()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(Map.of("error", "El email ya está registrado"));
            }

            Usuario usuario = new Usuario();
            usuario.setEmail(registerRequest.email());
            usuario.setPassword(passwordEncoder.encode(registerRequest.password()));
            usuario.setNombre(registerRequest.nombre());
            usuario.setApellidos(registerRequest.apellidos());
            usuario.setRoles("ROLE_ADMIN");  // ROL DE ADMINISTRADOR
            usuario.setEnabled(true);

            usuarioRepository.save(usuario);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of("message", "Administrador registrado correctamente"));

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al registrar administrador"));
        }
    }

    // NUEVO ENDPOINT: /auth/perfil
    @GetMapping("/perfil")
    public ResponseEntity<?> getPerfil(Authentication authentication) {
        // Extraer el JWT
        org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) authentication.getPrincipal();

        // Obtener email del JWT
        String email = jwt.getSubject();

        // Buscar usuario en la base de datos
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Object> perfil = new HashMap<>();
        perfil.put("id", usuario.getId());
        perfil.put("email", usuario.getEmail());
        perfil.put("nombre", usuario.getNombre());
        perfil.put("apellidos", usuario.getApellidos());
        perfil.put("fechaRegistro", usuario.getFechaRegistro());
        perfil.put("roles", usuario.getRoles());
        perfil.put("enabled", usuario.getEnabled());

        return ResponseEntity.ok(perfil);
    }

    // ENDPOINT DE PRUEBA para verificar roles y autenticación
    @GetMapping("/test-roles")
    public ResponseEntity<?> testRoles(Authentication authentication) {
        // Extraer el JWT
        org.springframework.security.oauth2.jwt.Jwt jwt = (org.springframework.security.oauth2.jwt.Jwt) authentication.getPrincipal();

        // Obtener datos del JWT
        String email = jwt.getSubject();

        // Los roles ahora son una lista, no un string
        Object rolesObj = jwt.getClaim("roles");

        // Buscar usuario en la base de datos
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Object> info = new HashMap<>();
        info.put("email", email);
        info.put("rolesFromJWT", rolesObj);
        info.put("authorities", authentication.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(java.util.stream.Collectors.toList()));
        info.put("isAdmin", authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        info.put("usuarioCompleto", Map.of(
                "id", usuario.getId(),
                "nombre", usuario.getNombre(),
                "apellidos", usuario.getApellidos()
        ));

        return ResponseEntity.ok(info);
    }
}