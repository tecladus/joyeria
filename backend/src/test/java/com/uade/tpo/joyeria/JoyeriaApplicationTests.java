package com.uade.tpo.joyeria;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.test.web.servlet.MockMvc;
import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class JoyeriaApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void contextLoads() {
    }

    @Test
    void adminCanCreateCategory() throws Exception {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
            "admin@example.com", null, List.of(new SimpleGrantedAuthority("ADMIN"))
        );
        SecurityContextHolder.getContext().setAuthentication(auth);

        String json = "{\"nombre\":\"NuevaCategoriaTest\"}";
        mockMvc.perform(post("/api/categorias")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json))
                .andExpect(status().isCreated());
    }
}
