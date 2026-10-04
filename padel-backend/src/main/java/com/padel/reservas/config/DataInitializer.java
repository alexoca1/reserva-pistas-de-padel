package com.padel.reservas.config;

import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.entities.Usuario;
import com.padel.reservas.repositories.ConfiguracionClubRepository;
import com.padel.reservas.repositories.UsuarioRepository;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer {

    private final UsuarioRepository usuarioRepository;
    private final ConfiguracionClubRepository configuracionClubRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminSeedPassword;
    private final String demoAdminSeedPassword;

    public DataInitializer(
            UsuarioRepository usuarioRepository,
            ConfiguracionClubRepository configuracionClubRepository,
            PasswordEncoder passwordEncoder,
            @Value("${ADMIN_SEED_PASSWORD:admin123}") String adminSeedPassword,
            @Value("${DEMO_ADMIN_SEED_PASSWORD:Demo2026!}") String demoAdminSeedPassword
    ) {
        this.usuarioRepository = usuarioRepository;
        this.configuracionClubRepository = configuracionClubRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminSeedPassword = adminSeedPassword;
        this.demoAdminSeedPassword = demoAdminSeedPassword;
    }

    @PostConstruct
    public void init() {
        String adminEmail = "admin@test.com";
        var adminExistente = usuarioRepository.findByEmail(adminEmail);
        if (adminExistente.isEmpty()) {
            Usuario admin = new Usuario();
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminSeedPassword));
            admin.setNombre("Admin");
            admin.setApellidos("Sistema");
            admin.setRoles("ROLE_ADMIN");
            admin.setEnabled(true);
            admin.setTelefono("600123123");
            admin.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.ADMIN);
            usuarioRepository.save(admin);
            System.out.println("[DataInitializer] Admin user created: " + adminEmail);
        } else {
            Usuario admin = adminExistente.get();
            boolean modificado = false;
            if (admin.getTelefono() == null || admin.getTelefono().isBlank()) {
                admin.setTelefono("600123123");
                modificado = true;
            }
            if (admin.getTipoAdmin() == null) {
                admin.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.ADMIN);
                modificado = true;
            }
            if (modificado) {
                usuarioRepository.save(admin);
            }
        }

        String demoEmail = "demo@padelreservas.es";
        var demoExistente = usuarioRepository.findByEmail(demoEmail);
        if (demoExistente.isEmpty()) {
            Usuario demoAdmin = new Usuario();
            demoAdmin.setEmail(demoEmail);
            demoAdmin.setPassword(passwordEncoder.encode(demoAdminSeedPassword));
            demoAdmin.setNombre("Admin");
            demoAdmin.setApellidos("Demo");
            demoAdmin.setRoles("ROLE_ADMIN");
            demoAdmin.setEnabled(true);
            demoAdmin.setTelefono("600123123");
            demoAdmin.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.DEMO_ADMIN);
            usuarioRepository.save(demoAdmin);
            System.out.println("[DataInitializer] Demo Admin user created: " + demoEmail);
        } else if (demoExistente.get().getTipoAdmin() != com.padel.reservas.entities.TipoAdmin.DEMO_ADMIN) {
            Usuario demo = demoExistente.get();
            demo.setTipoAdmin(com.padel.reservas.entities.TipoAdmin.DEMO_ADMIN);
            usuarioRepository.save(demo);
        }

        if (configuracionClubRepository.count() == 0) {
            configuracionClubRepository.save(new ConfiguracionClub());
            System.out.println("[DataInitializer] ConfiguracionClub creada con valores por defecto");
        }
    }
}
