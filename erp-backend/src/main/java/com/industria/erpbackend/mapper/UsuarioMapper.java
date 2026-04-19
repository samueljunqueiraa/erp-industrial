package com.industria.erpbackend.mapper;

import com.industria.erpbackend.entity.Usuario; // <--- Import da ENTITY (Correto)
import com.industria.erpbackend.dto.UsuarioResponseDTO;
import com.industria.erpbackend.dto.UsuarioLoginDTO;

public final class UsuarioMapper {

    private UsuarioMapper() {
    }

    // Converte Entidade (Banco) -> DTO (JSON Resposta)
    public static UsuarioResponseDTO toResponse(Usuario usuario) {
        if (usuario == null) {
            return null;
        }
        UsuarioResponseDTO dto = new UsuarioResponseDTO();
        
        // CORREÇÃO: Usa getEmail() ao invés de getLogin()
        dto.setEmail(usuario.getEmail());
        
        // CORREÇÃO: Usa getPapel() ao invés de getGrupo()
        if (usuario.getPapel() != null) {
            dto.setPapel(usuario.getPapel().name());
        }
        
        // OBS: Removemos 'setObs' pois esse campo não existe na tabela nova
        
        return dto;
    }

    // Converte DTO (Login) -> Entidade (Banco)
    public static Usuario toEntity(UsuarioLoginDTO loginDto) {
        if (loginDto == null) {
            return null;
        }
        Usuario usuario = new Usuario();
        
        // CORREÇÃO: O DTO agora usa getEmail()
        usuario.setEmail(loginDto.getEmail());
        
        // CORREÇÃO: Na entidade o campo é senhaHash
        usuario.setSenhaHash(loginDto.getSenha());
        
        return usuario;
    }
}