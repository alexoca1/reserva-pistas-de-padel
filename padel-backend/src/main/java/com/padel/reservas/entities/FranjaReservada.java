package com.padel.reservas.entities;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(
    name = "franjas_reservadas",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_pista_fecha_slot",
        columnNames = {"pista_id", "fecha", "hora_slot"}
    )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class FranjaReservada {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pista_id", nullable = false)
    @JsonIgnore
    private Pista pista;

    @Column(name = "fecha", nullable = false)
    private LocalDate fecha;

    @Column(name = "hora_slot", nullable = false)
    @JsonFormat(pattern = "HH:mm")
    private LocalTime horaSlot;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reserva_id", nullable = false)
    @JsonIgnore
    private Reserva reserva;
}
