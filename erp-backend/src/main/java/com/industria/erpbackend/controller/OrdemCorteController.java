package com.industria.erpbackend.controller;

import com.industria.erpbackend.dto.OrdemCorteDTO;
import com.industria.erpbackend.entity.*;
import com.industria.erpbackend.enums.StatusOrdem;
import com.industria.erpbackend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/ordens")
@CrossOrigin("*")
public class OrdemCorteController {

    @Autowired private OrdemCorteRepository ordemRepository;
    @Autowired private ProdutoRepository produtoRepository;
    @Autowired private TamanhoRepository tamanhoRepository;
    @Autowired private CorRepository corRepository;
    @Autowired private TecidoRepository tecidoRepository;
    @Autowired private CategoriaRepository categoriaRepository;
    @GetMapping("/tamanhos")
    public ResponseEntity<List<Tamanho>> listarTamanhos() {
        return ResponseEntity.ok(tamanhoRepository.findAll());
    }

    @PostMapping
    @Transactional
    public ResponseEntity<OrdemCorte> criar(@RequestBody OrdemCorteDTO dto) {
        Produto produto = produtoRepository.findById(dto.getProdutoId())
                .orElseThrow(() -> new RuntimeException("Produto não encontrado")); 

        OrdemCorte ordem = new OrdemCorte();
        ordem.setProduto(produto);
        ordem.setBotaoCodigo(dto.getBotaoCodigo());
        ordem.setLinhaCor(dto.getLinhaCor());
        ordem.setZipperCor(dto.getZipperCor());
        ordem.setObservacao(dto.getObservacao());
        ordem.setDataEmissao(java.time.LocalDate.now());
        ordem.setDataCriacao(java.time.LocalDate.now());
        
        if (dto.getStatus() != null) {
            try {
                ordem.setStatus(StatusOrdem.valueOf(dto.getStatus()));
            } catch (Exception e) {
                ordem.setStatus(StatusOrdem.PLANEJADA);
            }
        } else {
            ordem.setStatus(StatusOrdem.PLANEJADA);
        }

        int totalPecas = 0;
        if (dto.getGrade() != null) {
            for (OrdemCorteDTO.ItemGradeDTO itemDto : dto.getGrade()) {
                if (itemDto.quantidade != null && itemDto.quantidade > 0) {
                    Tamanho tam = tamanhoRepository.findById(itemDto.tamanhoId)
                            .orElseThrow(() -> new RuntimeException("Tamanho inválido ID: " + itemDto.tamanhoId));
                    
                    ordem.adicionarItemGrade(tam, itemDto.quantidade);
                    totalPecas += itemDto.quantidade;
                }
            }
        }
        ordem.setQuantidadeTotal(totalPecas);

        OrdemCorte saved = ordemRepository.save(ordem); 
        saved.setCodigoOrdem("OC-" + saved.getId());
        return ResponseEntity.ok(ordemRepository.save(saved));
    }

    @GetMapping 
    public ResponseEntity<List<OrdemCorteDTO>> listarTodas() {
         List<OrdemCorte> lista = ordemRepository.findAll();
         List<OrdemCorteDTO> dtos = lista.stream().map(ordem -> {
             OrdemCorteDTO dto = new OrdemCorteDTO();
             dto.setId(ordem.getId());
             dto.setNumeroLote(ordem.getNumeroLote()); 
             dto.setCodigoOrdem(ordem.getCodigoOrdem());
             dto.setDataEmissao(ordem.getDataEmissao());
             dto.setDataCriacao(ordem.getDataCriacao());
             dto.setStatus(ordem.getStatus().toString());
             if (ordem.getProduto() != null) {
                 dto.setProdutoId(ordem.getProduto().getId());
                 dto.setProdutoNome(ordem.getProduto().getNome());
                 dto.setProdutoReferencia(ordem.getProduto().getReferenciaBase());
             }
             if (ordem.getQuantidadeTotal() != null && ordem.getQuantidadeTotal() > 0) {
                 dto.setQuantidadeTotal(ordem.getQuantidadeTotal());
             } else {
                 int total = ordem.getItens().stream().mapToInt(i -> i.getQtdPlanejada()).sum();
                 dto.setQuantidadeTotal(total);
             }
             return dto;
         }).toList();
         return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemCorteDTO> buscarPorId(@PathVariable Long id) {
        OrdemCorte ordem = ordemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem não encontrada"));
        OrdemCorteDTO dto = new OrdemCorteDTO();
        dto.setId(ordem.getId());
        dto.setNumeroLote(ordem.getNumeroLote());
        dto.setCodigoOrdem(ordem.getCodigoOrdem());
        dto.setDataCriacao(ordem.getDataCriacao());
        dto.setDataEmissao(ordem.getDataEmissao());
        dto.setStatus(ordem.getStatus().toString());
        dto.setObservacao(ordem.getObservacao());
        dto.setBotaoCodigo(ordem.getBotaoCodigo());
        dto.setLinhaCor(ordem.getLinhaCor());
        dto.setZipperCor(ordem.getZipperCor());
        
        if (ordem.getProduto() != null) {
            Produto p = ordem.getProduto();
            dto.setProdutoId(p.getId());
            dto.setProdutoNome(p.getNome());
            dto.setProdutoReferencia(p.getReferenciaBase());
            dto.setProdutoImagemUrl(p.getImagemUrl());
            if (p.getCorId() != null) {
                String nomeCor = corRepository.findById(p.getCorId())
                    .map(c -> c.getNome()).orElse("Cor não encontrada");
                dto.setProdutoCor(nomeCor);
                dto.setProdutoCorId(p.getCorId()); 
            }
            if (p.getTecidoId() != null) {
                String nomeTecido = tecidoRepository.findById(p.getTecidoId())
                    .map(t -> t.getNome()).orElse("Tecido n/d");
                dto.setProdutoTecido(nomeTecido);
            }
            if (p.getCategoriaId() != null) {
                String nomeCat = categoriaRepository.findById(p.getCategoriaId())
                    .map(c -> c.getNome()).orElse("-");
                dto.setProdutoCategoria(nomeCat);
            }
        }
        
        List<OrdemCorteDTO.ItemGradeDTO> grade = ordem.getItens().stream().map(item -> {
            OrdemCorteDTO.ItemGradeDTO itemDto = new OrdemCorteDTO.ItemGradeDTO();
            itemDto.tamanhoId = item.getTamanho().getId();
            itemDto.quantidade = item.getQtdPlanejada();
            return itemDto;
        }).collect(Collectors.toList());
        dto.setGrade(grade);
        
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{id}")
    @Transactional
    public ResponseEntity<OrdemCorte> atualizar(@PathVariable Long id, @RequestBody OrdemCorteDTO dto) {
        OrdemCorte ordem = ordemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem não encontrada"));

        ordem.setObservacao(dto.getObservacao());
        ordem.setBotaoCodigo(dto.getBotaoCodigo());
        ordem.setLinhaCor(dto.getLinhaCor());
        ordem.setZipperCor(dto.getZipperCor());
        
        if (dto.getStatus() != null) {
            try {
                ordem.setStatus(StatusOrdem.valueOf(dto.getStatus())); 
            } catch (Exception e) {}
        }
        
        return ResponseEntity.ok(ordemRepository.save(ordem));
    }
}