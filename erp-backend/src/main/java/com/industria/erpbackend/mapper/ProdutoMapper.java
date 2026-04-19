package com.industria.erpbackend.mapper;

import com.industria.erpbackend.dto.ProdutoDTO;
import com.industria.erpbackend.entity.Produto;
import org.springframework.stereotype.Component;

@Component
public class ProdutoMapper {

    public Produto toEntity(ProdutoDTO dto) {
        if (dto == null) return null;

        Produto entity = new Produto();
        entity.setId(dto.getId());
        entity.setNome(dto.getNome());
        entity.setReferenciaBase(dto.getReferenciaBase());
        entity.setDescricao(dto.getDescricao());
        entity.setPrecoBase(dto.getPrecoBase());
        entity.setAtivo(dto.getAtivo());
        entity.setImagemUrl(dto.getImagemUrl());
        entity.setTecidoId(dto.getTecidoId());
        entity.setCategoriaId(dto.getCategoriaId());
        entity.setCorId(dto.getCorId());
        return entity;
    }

    public ProdutoDTO toDTO(Produto entity) {
        if (entity == null) return null;

        ProdutoDTO dto = new ProdutoDTO();
        dto.setId(entity.getId());
        dto.setNome(entity.getNome());
        dto.setReferenciaBase(entity.getReferenciaBase());
        dto.setDescricao(entity.getDescricao());
        dto.setPrecoBase(entity.getPrecoBase());
        dto.setAtivo(entity.getAtivo());
        dto.setImagemUrl(entity.getImagemUrl());
        dto.setTecidoId(entity.getTecidoId());
        dto.setCategoriaId(entity.getCategoriaId());
        dto.setCorId(entity.getCorId());
        
        return dto;
    }
}