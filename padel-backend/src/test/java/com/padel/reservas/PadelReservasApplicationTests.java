package com.padel.reservas;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest(classes = PadelReservasApplication.class)
@TestPropertySource(properties = {
    "cloudinary.cloud-name=test",
    "cloudinary.api-key=test",
    "cloudinary.api-secret=test"
})
class PadelReservasApplicationTests {

	@Test
	void contextLoads() {
	}

}
