package com.padel.reservas.services;

import com.padel.reservas.dto.UpdateConfiguracionDTO;
import com.padel.reservas.entities.ConfiguracionClub;
import com.padel.reservas.repositories.ConfiguracionClubRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ConfiguracionClubService {

    private final ConfiguracionClubRepository repo;

    public ConfiguracionClub getConfiguracion() {
        return repo.findById(1L)
            .orElseThrow(() -> new IllegalStateException(
                "ConfiguracionClub no inicializada — revisar DataInitializer"));
    }

    @Transactional
    public ConfiguracionClub actualizar(UpdateConfiguracionDTO dto) {
        ConfiguracionClub config = getConfiguracion();
        if (dto.duracionMinimaMinutos() != null)
            config.setDuracionMinimaMinutos(dto.duracionMinimaMinutos());
        if (dto.duracionesPermitidasMinutos() != null)
            config.setDuracionesPermitidasMinutos(dto.duracionesPermitidasMinutos());
        if (dto.duracionPorDefectoMinutos() != null)
            config.setDuracionPorDefectoMinutos(dto.duracionPorDefectoMinutos());
        if (dto.maximoMinutosPorDia() != null)
            config.setMaximoMinutosPorDia(dto.maximoMinutosPorDia());
        if (dto.horaApertura() != null)
            config.setHoraApertura(dto.horaApertura());
        if (dto.horaCierre() != null)
            config.setHoraCierre(dto.horaCierre());
        if (dto.diasAntelacionMaxima() != null)
            config.setDiasAntelacionMaxima(dto.diasAntelacionMaxima());
        return repo.save(config);
    }
}
