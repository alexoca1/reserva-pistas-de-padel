package hernandez_ocampo_hernandez.demo.entities;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "reservas")
@Entity
public class Reserva {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(nullable = false)
    private LocalDate fechaReserva;

    @NotBlank
    @Column(nullable = false)
    private String horaInicio;

    @NotBlank
    @Column(nullable = false)
    private String horaFin;

    @NotBlank
    @Column(nullable = false)
    private String nombreJugador;

    @NotBlank
    @Column(nullable = false)
    private String telefono;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "pista_id", nullable = false)
    private Pista pista;

    @NotNull
    @ManyToOne(optional = false)
    @JoinColumn(name = "usuario_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles", "enabled", "authorities", "accountNonExpired", "accountNonLocked", "credentialsNonExpired", "username"})
    private Usuario usuario;
}