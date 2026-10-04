package com.padel.reservas.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "fotos_sede")
@Getter @Setter @NoArgsConstructor
public class FotoSede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String url;

    @Column(name = "public_id", nullable = false)
    private String publicId;

    @Column(nullable = false)
    private Integer orden = 0;
}
