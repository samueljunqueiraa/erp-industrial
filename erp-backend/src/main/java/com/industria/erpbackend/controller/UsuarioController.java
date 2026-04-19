package com.industria.erpbackend.controller;

import com.industria.erpbackend.dto.UsuarioDTO;
import com.industria.erpbackend.service.UsuarioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
// @CrossOrigin(origins = "*") // Descomente se tiver problema de CORS, mas geralmente configuramos globalmente
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // Listar todos (para sua tabela de gestão)
    @GetMapping
    public ResponseEntity<List<UsuarioDTO>> findAll() {
        return ResponseEntity.ok(service.findAll());
    }

    // Criar novo (com senha criptografada)
    @PostMapping
    public ResponseEntity<UsuarioDTO> insert(@RequestBody UsuarioDTO dto) {
        UsuarioDTO newDto = service.insert(dto);
        URI uri = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(newDto.id()).toUri();
        return ResponseEntity.created(uri).body(newDto);
    }
    // Atualizar existente (incluindo ativar/inativar)

    @PutMapping("/{id}")
    public ResponseEntity<UsuarioDTO> update(@PathVariable Long id, @RequestBody UsuarioDTO dto) {
        UsuarioDTO newDto = service.update(id, dto);
        return ResponseEntity.ok(newDto);
    }
}