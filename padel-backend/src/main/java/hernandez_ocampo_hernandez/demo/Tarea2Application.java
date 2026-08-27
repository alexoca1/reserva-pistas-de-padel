package hernandez_ocampo_hernandez.demo;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@EnableJpaAuditing
@SpringBootApplication
public class Tarea2Application {

	public static void main(String[] args) {
		SpringApplication.run(Tarea2Application.class, args);
	}

}
