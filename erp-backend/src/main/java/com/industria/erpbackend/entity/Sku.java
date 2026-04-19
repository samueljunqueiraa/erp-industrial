package com.industria.erpbackend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "tb_sku")
public class Sku {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id; // O ID do SKU LONG

    @Column(name = "produto_id")
    private Long produtoId;

    @Column(name = "cor_id")
    private Integer corId;

    @Column(name = "tamanho_id")
    private Integer tamanhoId;
    
    private String codigoBarras;

    // --- GETTERS E SETTERS ---
    public Long getId() { return id; }

    public void setProdutoId(Long produtoId) { this.produtoId = produtoId; }
    public Long getProdutoId() { return produtoId; }
    
    public void setCorId(Integer corId) { this.corId = corId; }
    public Integer getCorId() { return corId; }

    public void setTamanhoId(Integer tamanhoId) { this.tamanhoId = tamanhoId; }
    public Integer getTamanhoId() { return tamanhoId; }
    
    public void setCodigoBarras(String codigoBarras) { this.codigoBarras = codigoBarras; }
    public String getCodigoBarras() { return codigoBarras; }
}