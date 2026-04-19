package com.industria.erpbackend.controller;

import com.industria.erpbackend.entity.PapelUsuario;
import com.industria.erpbackend.entity.Usuario; 
import com.industria.erpbackend.repository.UsuarioRepository;
import com.industria.erpbackend.service.TokenService; 
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Optional;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UsuarioController.class)
@AutoConfigureMockMvc(addFilters = false) 
public class UsuarioControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UsuarioRepository usuarioRepository;

    @MockBean
    private TokenService tokenService; 
    @Test
    @DisplayName("GET /api/usuarios/{email} - Sucesso 200")
    public void getByEmail_ShouldReturn200() throws Exception {
        Usuario sample = new Usuario();
        sample.setEmail("teste@email.com");
        sample.setSenhaHash("senha123");
        sample.setPapel(PapelUsuario.ADMIN);
        sample.setNomeCompleto("João Teste");

        when(usuarioRepository.findByEmail(eq("teste@email.com"))).thenReturn(Optional.of(sample));

        // Act & Assert
        mockMvc.perform(get("/api/usuarios/teste@email.com")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("teste@email.com"))
                .andExpect(jsonPath("$.nomeCompleto").value("João Teste"))
                .andExpect(jsonPath("$.papel").value("ADMIN"));
    }

    @Test
    @DisplayName("GET /api/usuarios/{email} - Erro 404 Não Encontrado")
    public void getByEmail_ShouldReturn404() throws Exception {
        // Arrange:
        when(usuarioRepository.findByEmail(eq("naoexiste@email.com"))).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/usuarios/naoexiste@email.com")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }
}