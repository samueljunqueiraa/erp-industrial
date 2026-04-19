package com.industria.erpbackend.dto;

import java.math.BigDecimal;

public class ProdutoDTO {

    private Long id;
    private String nome;
    private String referenciaBase;
    private String descricao;
    private BigDecimal precoBase;
    private Boolean ativo;
    private String imagemUrl;
    private Integer tecidoId;
    private Integer categoriaId;
    private Integer corId;      
    private String nomeCor;
    private String nomeTecido;
    private String nomeCategoria;

    public ProdutoDTO() {
    }

    // --- GETTERS E SETTERS ---

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
    
    public Integer getCorId() { return corId; }
    public void setCorId(Integer corId) { this.corId = corId; }

    public String getNomeCor() { return nomeCor; }
    public void setNomeCor(String nomeCor) { this.nomeCor = nomeCor; }

    public String getNomeTecido() {
        return nomeTecido;
    }

    public void setNomeTecido(String nomeTecido) {
        this.nomeTecido = nomeTecido;
    }

    public String getNomeCategoria() {
        return nomeCategoria;
    }

    public void setNomeCategoria(String nomeCategoria) {
        this.nomeCategoria = nomeCategoria;
    }
}