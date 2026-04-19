package com.industria.erpbackend.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.industria.erpbackend.entity.Usuario;

public record UsuarioDTO(
    Long id,
    String nomeCompleto,
    String email,
    
    // O React ENVIA a senha aqui, mas o Java NUNCA DEVOLVE (Write Only)
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    String senha, 
    
    String papel,
    Boolean ativo
) {
    public UsuarioDTO(Usuario entity) {
        this(
            entity.getId(),
            entity.getNomeCompleto(),
            entity.getEmail(),
            null, // Senha sempre nula na volta
            entity.getPapel().name(),
            entity.getAtivo()
        );
    }
}