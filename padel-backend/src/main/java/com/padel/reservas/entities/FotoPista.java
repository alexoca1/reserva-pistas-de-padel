package com.padel.reservas.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "fotos_pista")
@Getter @Setter @NoArgsConstructor
public class FotoPista {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "pista_id", nullable = false)
    private Pista pista;

    @Column(nullable = false)
    private String url;

    @Column(name = "public_id", nullable = false)
    private String publicId;

    @Column(name = "es_portada", nullable = false)
    private boolean esPortada = false;

    @Column(nullable = false)
    private Integer orden = 0;
}
