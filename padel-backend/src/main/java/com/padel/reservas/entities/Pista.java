package com.padel.reservas.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.util.List;

@EntityListeners(AuditingEntityListener.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name="pistas")
@Entity
public class Pista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private Integer numeroPista;
    private boolean tieneIluminacion;
    private String comentarios;
    private String imagenUrl;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDate fechaAlta;

    @UpdateTimestamp
    private LocalDate fechaModificacion;

    @JsonIgnore
    @OneToMany(mappedBy = "pista", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Reserva> reservas;

    @JsonIgnore
    @OneToMany(mappedBy = "pista", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<FotoPista> fotos = new java.util.ArrayList<>();

}

