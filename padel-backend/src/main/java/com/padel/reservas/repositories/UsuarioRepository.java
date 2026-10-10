package com.padel.reservas.repositories;

import com.padel.reservas.entities.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    long countByRolesContaining(String role);
    long countByEmailEndingWith(String suffix);
}
