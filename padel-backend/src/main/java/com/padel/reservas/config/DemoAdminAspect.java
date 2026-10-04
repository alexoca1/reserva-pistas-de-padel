package com.padel.reservas.config;

import com.padel.reservas.entities.TipoAdmin;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
@RequiredArgsConstructor
public class DemoAdminAspect {

    private final UsuarioRepository usuarioRepository;

    @Before("@annotation(com.padel.reservas.config.NoDemoAdmin)")
    public void verificarNoDemoAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getName() == null) {
            return;
        }

        usuarioRepository.findByEmail(auth.getName()).ifPresent(usuario -> {
            if (usuario.getTipoAdmin() == TipoAdmin.DEMO_ADMIN) {
                throw new AccessDeniedException("Acción no disponible en modo demostración.");
            }
        });
    }
}
