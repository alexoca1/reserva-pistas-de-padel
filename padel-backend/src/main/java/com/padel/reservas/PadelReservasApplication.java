/*
 * Reserva de Pistas de Pádel — Club Pádel Calatrava
 * Copyright (c) 2026 Alexander Ocampo Hernandez
 * Licencia: Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International
 *           https://creativecommons.org/licenses/by-nc-sa/4.0/
 * Repositorio: https://github.com/alexoca1/reserva-pistas-de-padel
 */
package com.padel.reservas;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@EnableScheduling
@EnableJpaAuditing
@SpringBootApplication
public class PadelReservasApplication {

	public static void main(String[] args) {
		SpringApplication.run(PadelReservasApplication.class, args);
	}

}
