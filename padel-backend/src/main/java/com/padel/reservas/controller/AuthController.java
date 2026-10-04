package com.padel.reservas.controller;

import com.padel.reservas.dto.LoginRequest;
import com.padel.reservas.dto.RegisterRequest;
import com.padel.reservas.dto.UpdatePerfilDTO;
import com.padel.reservas.dto.SubidaResult;
import com.padel.reservas.entities.RefreshToken;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.UsuarioRepository;
import com.padel.reservas.services.CloudinaryService;
import com.padel.reservas.services.JwtService;
import com.padel.reservas.services.RefreshTokenService;
import com.padel.reservas.services.SecurityAuditService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.security.access.prepost.PreAuthorize;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.padel.reservas.repositories.RefreshTokenRepository;
import com.padel.reservas.repositories.ReservaRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenRepository refreshTokenRepository;
    private final ReservaRepository reservaRepository;
    private final CloudinaryService cloudinaryService;
    private final SecurityAuditService securityAuditService;

    @Value("${app.cookie.secure:false}")
    private boolean cookieSecure;

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password())
            );

            Usuario usuario = (Usuario) authentication.getPrincipal();
            String accessToken = jwtService.generateToken(usuario);
            RefreshToken refreshToken = refreshTokenService.createRefreshToken(usuario);

            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", refreshToken.getToken())
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(Duration.ofDays(7))
                    .build();

            Map<String, Object> userMap = new HashMap<>();
            userMap.put("id", usuario.getId());
            userMap.put("email", usuario.getEmail());
            userMap.put("nombre", usuario.getNombre());
            userMap.put("apellidos", usuario.getApellidos());
            userMap.put("roles", usuario.getRoles());
            userMap.put("telefono", usuario.getTelefono());
            userMap.put("avatarUrl", usuario.getAvatarUrl());
            userMap.put("tipoAdmin", usuario.getTipoAdmin());

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", accessToken);
            responseBody.put("accessToken", accessToken);
            responseBody.put("user", userMap);

            securityAuditService.loginExitoso(loginRequest.email());
            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(responseBody);

        } catch (BadCredentialsException e) {
            securityAuditService.loginFallido(loginRequest.email());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciales incorrectas"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error en el servidor"));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@CookieValue(name = "refreshToken", required = false) String refreshTokenCookie) {
        if (refreshTokenCookie == null || refreshTokenCookie.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Cookie de refresh token no encontrada"));
        }

        try {
            RefreshToken newRefreshToken = refreshTokenService.rotateRefreshToken(refreshTokenCookie);
            Usuario usuario = newRefreshToken.getUsuario();
            String newAccessToken = jwtService.generateToken(usuario);

            ResponseCookie refreshCookie = ResponseCookie.from("refreshToken", newRefreshToken.getToken())
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(Duration.ofDays(7))
                    .build();

            Map<String, Object> refreshUserMap = new HashMap<>();
            refreshUserMap.put("id", usuario.getId());
            refreshUserMap.put("email", usuario.getEmail());
            refreshUserMap.put("nombre", usuario.getNombre());
            refreshUserMap.put("apellidos", usuario.getApellidos());
            refreshUserMap.put("roles", usuario.getRoles());
            refreshUserMap.put("enabled", usuario.getEnabled());
            refreshUserMap.put("telefono", usuario.getTelefono());
            refreshUserMap.put("avatarUrl", usuario.getAvatarUrl());
            refreshUserMap.put("tipoAdmin", usuario.getTipoAdmin());

            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("token", newAccessToken);
            responseBody.put("accessToken", newAccessToken);
            responseBody.put("user", refreshUserMap);

            return ResponseEntity.ok()
                    .header(HttpHeaders.SET_COOKIE, refreshCookie.toString())
                    .body(responseBody);

        } catch (BadCredentialsException e) {
            // Si el token es inválido o reutilizado, limpiar la cookie en el cliente
            ResponseCookie cleanCookie = ResponseCookie.from("refreshToken", "")
                    .httpOnly(true)
                    .secure(cookieSecure)
                    .path("/")
                    .sameSite("Lax")
                    .maxAge(0)
                    .build();

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .header(HttpHeaders.SET_COOKIE, cleanCookie.toString())
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Error al procesar el refresco del token"));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@CookieValue(name = "refreshToken", required = false) String refreshTokenCookie) {
        if (refreshTokenCookie != null && !refreshTokenCookie.isBlank()) {
            refreshTokenService.revokeRefreshToken(refreshTokenCookie);
        }

        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        securityAuditService.logout("(token revocado)");
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(Map.of("message", "Sesión cerrada correctamente"));
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
            usuario.setTelefono(registerRequest.telefono());

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
    @PreAuthorize("hasRole('ADMIN')")
    @com.padel.reservas.config.NoDemoAdmin
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
            usuario.setTelefono(registerRequest.telefono());
            usuario.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.ADMIN);

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
        perfil.put("telefono", usuario.getTelefono());
        perfil.put("fechaRegistro", usuario.getFechaRegistro());
        perfil.put("roles", usuario.getRoles());
        perfil.put("enabled", usuario.getEnabled());
        perfil.put("avatarUrl", usuario.getAvatarUrl());
        perfil.put("tipoAdmin", usuario.getTipoAdmin());

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

    // Lista todos los usuarios registrados (solo ADMIN)
    @GetMapping("/usuarios")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> listarUsuarios() {
        List<Map<String, Object>> usuarios = usuarioRepository.findAll().stream()
                .map(u -> {
                    Map<String, Object> datos = new HashMap<>();
                    datos.put("id", u.getId());
                    datos.put("email", u.getEmail());
                    datos.put("nombre", u.getNombre());
                    datos.put("apellidos", u.getApellidos());
                    datos.put("roles", u.getRoles());
                    datos.put("telefono", u.getTelefono());
                    datos.put("tipoAdmin", u.getTipoAdmin());
                    return datos;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(usuarios);
    }

    @PutMapping("/perfil")
    public ResponseEntity<?> updatePerfil(@Valid @RequestBody UpdatePerfilDTO dto, Authentication authentication) {
        Optional<Usuario> usuarioOpt;
        if (isAdmin(authentication) && dto.usuarioId() != null) {
            usuarioOpt = usuarioRepository.findById(dto.usuarioId());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Usuario con ID " + dto.usuarioId() + " no encontrado"));
            }
        } else {
            usuarioOpt = usuarioRepository.findByEmail(authentication.getName());
            if (usuarioOpt.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Usuario autenticado no encontrado"));
            }
        }

        Usuario usuario = usuarioOpt.get();

        // Validar cambio de correo si se especifica un email distinto
        String emailAntiguo = usuario.getEmail();
        boolean cambiaEmail = dto.email() != null && !dto.email().isBlank() && !dto.email().equalsIgnoreCase(emailAntiguo);
        if (cambiaEmail) {
            Optional<Usuario> existente = usuarioRepository.findByEmail(dto.email().trim().toLowerCase());
            if (existente.isPresent() && !existente.get().getId().equals(usuario.getId())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "El correo electrónico ya está registrado por otro usuario"));
            }
            usuario.setEmail(dto.email().trim().toLowerCase());
        }

        // Validar cambio de contraseña si viene especificada
        boolean cambiaPassword = dto.password() != null && !dto.password().isBlank();
        if (cambiaPassword) {
            boolean esAdminEditandoOtro = isAdmin(authentication) && dto.usuarioId() != null;
            if (!esAdminEditandoOtro) {
                if (dto.currentPassword() == null || dto.currentPassword().isBlank()) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "Debes ingresar tu contraseña actual para cambiarla"));
                }
                if (!passwordEncoder.matches(dto.currentPassword(), usuario.getPassword())) {
                    return ResponseEntity.badRequest()
                            .body(Map.of("error", "La contraseña actual es incorrecta"));
                }
            }

            if (dto.password().length() < 6) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "La nueva contraseña debe tener al menos 6 caracteres"));
            }
            usuario.setPassword(passwordEncoder.encode(dto.password()));
        }

        usuario.setNombre(dto.nombre());
        usuario.setApellidos(dto.apellidos());
        usuario.setTelefono(dto.telefono());

        Usuario saved = usuarioRepository.save(usuario);

        if (cambiaPassword) securityAuditService.cambioPassword(saved.getEmail());
        if (cambiaEmail)    securityAuditService.cambioEmail(emailAntiguo, saved.getEmail());

        Map<String, Object> responseBody = new HashMap<>();
        responseBody.put("id", saved.getId());
        responseBody.put("email", saved.getEmail());
        responseBody.put("nombre", saved.getNombre());
        responseBody.put("apellidos", saved.getApellidos());
        responseBody.put("telefono", saved.getTelefono());
        responseBody.put("roles", saved.getRoles());
        responseBody.put("avatarUrl", saved.getAvatarUrl());

        return ResponseEntity.ok(responseBody);
    }

    @PutMapping("/perfil/avatar")
    public ResponseEntity<?> actualizarAvatar(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        Optional<Usuario> usuarioOpt =
            usuarioRepository.findByEmail(authentication.getName());
        if (usuarioOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("Usuario no encontrado");
        }

        Usuario usuario = usuarioOpt.get();

        try {
            // Borrar avatar anterior de Cloudinary si existe (RGPD)
            if (usuario.getAvatarPublicId() != null
                    && !usuario.getAvatarPublicId().isBlank()) {
                cloudinaryService.eliminar(usuario.getAvatarPublicId());
            }

            SubidaResult resultado = cloudinaryService.subir(
                file, "avatares", 400);

            usuario.setAvatarUrl(resultado.url());
            usuario.setAvatarPublicId(resultado.publicId());
            usuarioRepository.save(usuario);
            securityAuditService.avatarActualizado(usuario.getEmail());

            return ResponseEntity.ok(Map.of(
                "id",         usuario.getId(),
                "email",      usuario.getEmail(),
                "nombre",     usuario.getNombre(),
                "apellidos",  usuario.getApellidos(),
                "telefono",   usuario.getTelefono() != null ? usuario.getTelefono() : "",
                "roles",      usuario.getRoles(),
                "avatarUrl",  usuario.getAvatarUrl()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body("Error al actualizar el avatar: " + e.getMessage());
        }
    }

    @GetMapping("/mis-datos")
    public ResponseEntity<?> getMisDatos(Authentication authentication) {
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Map<String, Object> perfil = new HashMap<>();
        perfil.put("id", usuario.getId());
        perfil.put("nombre", usuario.getNombre());
        perfil.put("apellidos", usuario.getApellidos());
        perfil.put("email", usuario.getEmail());
        perfil.put("telefono", usuario.getTelefono());
        perfil.put("avatarUrl", usuario.getAvatarUrl());
        perfil.put("roles", usuario.getRoles());
        perfil.put("fechaRegistro", usuario.getFechaRegistro());

        List<Map<String, Object>> reservas = reservaRepository.findByUsuarioEmail(email).stream()
                .map(r -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", r.getId());
                    map.put("codigoReserva", r.getCodigoReserva());
                    map.put("fechaReserva", r.getFechaReserva());
                    map.put("horaInicio", r.getHoraInicio() != null ? r.getHoraInicio().toString() : null);
                    map.put("horaFin", r.getHoraFin() != null ? r.getHoraFin().toString() : null);
                    map.put("estado", r.getEstado() != null ? r.getEstado().name() : null);
                    map.put("nombreJugador", r.getNombreJugador());
                    map.put("telefono", r.getTelefono());
                    map.put("pistaId", r.getPista() != null ? r.getPista().getId() : null);
                    map.put("numeroPista", r.getPista() != null ? r.getPista().getNumeroPista() : null);
                    return map;
                })
                .toList();

        Map<String, Object> resultado = new HashMap<>();
        resultado.put("perfil", perfil);
        resultado.put("reservas", reservas);
        resultado.put("fechaExportacion", java.time.LocalDateTime.now().toString());

        return ResponseEntity.ok(resultado);
    }

    @com.padel.reservas.config.NoDemoAdmin
    @DeleteMapping("/cuenta")
    @Transactional
    public ResponseEntity<?> eliminarCuenta(Authentication authentication) {
        String email = authentication.getName();
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        boolean esAdmin = usuario.getRoles() != null && usuario.getRoles().contains("ROLE_ADMIN");
        if (esAdmin) {
            long totalAdmins = usuarioRepository.countByRolesContaining("ROLE_ADMIN");
            if (totalAdmins <= 1) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(Map.of("error", "No puedes eliminar la única cuenta de administrador"));
            }
        }

        // Purgar avatar de Cloudinary si existe (RGPD)
        if (usuario.getAvatarPublicId() != null && !usuario.getAvatarPublicId().isBlank()) {
            try {
                cloudinaryService.eliminar(usuario.getAvatarPublicId());
            } catch (Exception e) {
                // Log and continue anonymization
            }
        }

        // Revocar refresh tokens asociados
        refreshTokenRepository.deleteByUsuario(usuario);

        // Anonimización irreversible
        String emailAnonimo = "deleted_" + usuario.getId() + "_" + System.currentTimeMillis() + "@removed.invalid";
        usuario.setEmail(emailAnonimo);
        usuario.setNombre("Usuario eliminado");
        usuario.setApellidos("");
        usuario.setTelefono(null);
        usuario.setAvatarUrl(null);
        usuario.setAvatarPublicId(null);
        usuario.setEnabled(false);
        usuario.setFechaBaja(java.time.LocalDateTime.now());
        usuarioRepository.save(usuario);

        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(cookieSecure)
                .path("/")
                .sameSite("Lax")
                .maxAge(0)
                .build();

        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .build();
    }

    private boolean isAdmin(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));
    }
}