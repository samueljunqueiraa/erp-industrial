package com.industria.erpbackend.service;

import com.industria.erpbackend.dto.UsuarioDTO;
import com.industria.erpbackend.entity.PapelUsuario;
import com.industria.erpbackend.entity.Usuario;
import com.industria.erpbackend.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository repository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Transactional(readOnly = true)
    public List<UsuarioDTO> findAll() {
        return repository.findAll().stream().map(UsuarioDTO::new).toList();
    }

    @Transactional
    public UsuarioDTO insert(UsuarioDTO dto) {
        Usuario entity = new Usuario();
        entity.setNomeCompleto(dto.nomeCompleto());
        entity.setEmail(dto.email());
        
        entity.setSenhaHash(passwordEncoder.encode(dto.senha()));
        
        entity.setPapel(PapelUsuario.valueOf(dto.papel())); 
        
        entity.setAtivo(true); // Padrão: novo usuário nasce ativo

        entity = repository.save(entity);
        return new UsuarioDTO(entity);
    }
    
    @Transactional
    public UsuarioDTO update(Long id, UsuarioDTO dto) {
        Usuario entity = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        entity.setNomeCompleto(dto.nomeCompleto());
        entity.setEmail(dto.email());
        entity.setPapel(PapelUsuario.valueOf(dto.papel()));
        entity.setAtivo(dto.ativo()); // Aqui permite Inativar!

        if (dto.senha() != null && !dto.senha().isBlank()) {
            entity.setSenhaHash(passwordEncoder.encode(dto.senha()));
        }

        entity = repository.save(entity);
        return new UsuarioDTO(entity);
    }
    
}