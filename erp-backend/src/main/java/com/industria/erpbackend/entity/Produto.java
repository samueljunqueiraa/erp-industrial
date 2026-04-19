package com.industria.erpbackend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "tb_produto")
public class Produto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(name = "referencia_base")
    private String referenciaBase;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(name = "preco_base")
    private BigDecimal precoBase;

    private Boolean ativo;

    @Column(name = "imagem_url")
    private String imagemUrl;

    // Chaves estrangeiras (IDs)
    @Column(name = "tecido_id")
    private Integer tecidoId;

    @Column(name = "categoria_id")
    private Integer categoriaId;
    
    @Column(name = "cor_id")
    private Integer corId;

    // --- CONSTRUTORES ---
    
    // O JPA exige um construtor vazio obrigatório
    public Produto() {
    }

    // Construtor com campos (opcional, mas útil)
    public Produto(String nome, String referenciaBase, BigDecimal precoBase) {
        this.nome = nome;
        this.referenciaBase = referenciaBase;
        this.precoBase = precoBase;
    }

    // --- GETTERS E SETTERS MANUAIS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNome() {
        return nome;
    }

    public void setNome(String nome) {
        this.nome = nome;
    }

    public String getReferenciaBase() {
        return referenciaBase;
    }

    public void setReferenciaBase(String referenciaBase) {
        this.referenciaBase = referenciaBase;
    }

    public String getDescricao() {
        return descricao;
    }

    public void setDescricao(String descricao) {
        this.descricao = descricao;
    }

    public BigDecimal getPrecoBase() {
        return precoBase;
    }

    public void setPrecoBase(BigDecimal precoBase) {
        this.precoBase = precoBase;
    }

    public Boolean getAtivo() {
        return ativo;
    }

    public void setAtivo(Boolean ativo) {
        this.ativo = ativo;
    }

    public String getImagemUrl() {
        return imagemUrl;
    }

    public void setImagemUrl(String imagemUrl) {
        this.imagemUrl = imagemUrl;
    }

    public Integer getTecidoId() {
        return tecidoId;
    }

    public void setTecidoId(Integer tecidoId) {
        this.tecidoId = tecidoId;
    }

    public Integer getCategoriaId() {
        return categoriaId;
    }

    public void setCategoriaId(Integer categoriaId) {
        this.categoriaId = categoriaId;
    }
    
    public Integer getCorId() { 
    	return corId; 
    }
    
    public void setCorId(Integer corId) { 
    	this.corId = corId; 
    }
}