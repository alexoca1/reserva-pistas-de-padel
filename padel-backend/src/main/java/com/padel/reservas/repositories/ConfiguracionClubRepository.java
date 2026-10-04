package com.padel.reservas.repositories;

import com.padel.reservas.entities.ConfiguracionClub;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConfiguracionClubRepository
        extends JpaRepository<ConfiguracionClub, Long> {
}
