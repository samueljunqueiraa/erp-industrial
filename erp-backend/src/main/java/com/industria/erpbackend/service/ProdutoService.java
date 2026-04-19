package com.industria.erpbackend.service;

import com.industria.erpbackend.dto.ProdutoDTO;
import com.industria.erpbackend.entity.Produto;
import com.industria.erpbackend.mapper.ProdutoMapper;
import com.industria.erpbackend.repository.ProdutoRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProdutoService {

    @Autowired
    private ProdutoRepository repository;

    @Autowired
    private ProdutoMapper mapper; 
    
    @Transactional(readOnly = true)
    public List<ProdutoDTO> buscar(String termo) {
        // Busca no banco usando o repositório
        List<Produto> list = repository.buscarPorNomeOuReferencia(termo);
        
        return list.stream()
            .map(mapper::toDTO) 
            .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ProdutoDTO> findAll() {
        return repository.findAll().stream()
                .map(mapper::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProdutoDTO findById(Long id) {
        Produto entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado ID: " + id));
        return mapper.toDTO(entity);
    }

    @Transactional
    public ProdutoDTO create(ProdutoDTO dto) {
        Produto entity = mapper.toEntity(dto);
        // O método .save() retorna a entidade com o ID gerado pelo banco
        entity = repository.save(entity);
        return mapper.toDTO(entity);
    }

    @Transactional
    public ProdutoDTO update(Long id, ProdutoDTO dto) {
        Produto entity = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Produto não encontrado ID: " + id));
        

        entity.setNome(dto.getNome());
        entity.setReferenciaBase(dto.getReferenciaBase());
        entity.setDescricao(dto.getDescricao());
        entity.setPrecoBase(dto.getPrecoBase());
        entity.setAtivo(dto.getAtivo());
        entity.setImagemUrl(dto.getImagemUrl());
        entity.setTecidoId(dto.getTecidoId());
        entity.setCategoriaId(dto.getCategoriaId());
        entity.setCorId(dto.getCorId());

        entity = repository.save(entity);
        return mapper.toDTO(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new EntityNotFoundException("Produto não encontrado ID: " + id);
        }
        repository.deleteById(id);
    }
}